import {
  Component,
  DestroyRef,
  Input,
  OnChanges,
  SimpleChanges,
  computed,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { GithubService } from '../../core/services/github.service';
import {
  CommitFrequencyPoint,
  ContributorSummary,
  RepoDetail,
  RepoHealth,
  RepoLanguages
} from '../../shared/models/github.models';
import { RepoHealthComponent } from '../repo-detail/repo-health.component';
import { LanguageChartComponent } from '../charts/language-chart.component';
import { CommitFrequencyChartComponent } from '../charts/commit-frequency-chart.component';
import { ContributorsComponent } from '../contributors/contributors.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader.component';
import { ErrorMessageComponent } from '../../shared/components/error-message.component';

@Component({
  selector: 'app-repo-analyzer',
  standalone: true,
  imports: [
    RepoHealthComponent,
    LanguageChartComponent,
    CommitFrequencyChartComponent,
    ContributorsComponent,
    SkeletonLoaderComponent,
    ErrorMessageComponent
  ],
  template: `
    @if (isLoading()) {
      <app-skeleton-loader mode="repo" />
    }

    @if (error()) {
      <app-error-message [message]="error()!" />
    }

    @if (hasResults()) {
      <div class="pane repo-header">
        <div class="repo-title-row">
          <div class="repo-fullname">{{ repoDetail()!.full_name }}</div>
          <div class="hero-stat">
            <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor"><path d="M8 .3l2.2 4.9 5.3.6-4 3.7 1.1 5.3L8 12.2l-4.6 2.6 1.1-5.3-4-3.7 5.3-.6L8 .3z"/></svg>
            <span class="hero-count">{{ repoDetail()!.stargazers_count }}</span>
          </div>
        </div>
        @if (repoDetail()!.description) {
          <div class="repo-desc">{{ repoDetail()!.description }}</div>
        }
        <div class="repo-stats-row">
          <span class="meta-stat">
            <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M5 3.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm5.5 1.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM6.5 5v1.5a1.5 1.5 0 0 0 1.5 1.5h.5v3.75a1.5 1.5 0 1 0 1 0V8h.5a1.5 1.5 0 0 0 1.5-1.5V5H10v1.5a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V5H6.5Z"/></svg>
            {{ repoDetail()!.forks_count }}
          </span>
          <span class="meta-stat">{{ repoDetail()!.open_issues_count }} open issues</span>
          <span class="meta-stat">{{ repoDetail()!.watchers_count }} watchers</span>
        </div>
      </div>

      <div class="repo-content">
        <app-repo-health class="full-width" [health]="repoHealth()!" />
        <app-commit-frequency-chart class="full-width" [data]="commitFrequency()" />
        <app-language-chart [languages]="languages()" [valueLabel]="'bytes'" />
        <app-contributors [contributors]="contributors()" />
      </div>
    }
  `,
  styleUrl: './repo-analyzer.component.scss'
})
export class RepoAnalyzerComponent implements OnChanges {
  private readonly githubService = inject(GithubService);
  private readonly destroyRef = inject(DestroyRef);

  @Input() repoQuery!: string;

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly repoDetail = signal<RepoDetail | null>(null);
  readonly repoHealth = signal<RepoHealth | null>(null);
  readonly languages = signal<RepoLanguages>({});
  readonly commitFrequency = signal<CommitFrequencyPoint[] | 'computing'>([]);
  readonly contributors = signal<ContributorSummary[]>([]);

  readonly hasResults = computed(() => this.repoDetail() !== null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['repoQuery'] && this.repoQuery) {
      const [owner, repo] = this.repoQuery.split('/');
      this.loadRepoData(owner, repo);
    }
  }

  private loadRepoData(owner: string, repo: string): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.repoDetail.set(null);
    this.repoHealth.set(null);
    this.languages.set({});
    this.commitFrequency.set([]);
    this.contributors.set([]);

    forkJoin({
      repoDetail: this.githubService.getRepoDetail(owner, repo),
      repoHealth: this.githubService.getRepoHealth(owner, repo),
      languages: this.githubService.getRepoLanguages(owner, repo),
      contributors: this.githubService.getContributors(owner, repo)
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ repoDetail, repoHealth, languages, contributors }) => {
          this.repoDetail.set(repoDetail);
          this.repoHealth.set(repoHealth);
          this.languages.set(languages);
          this.contributors.set(contributors);
          this.isLoading.set(false);
        },
        error: (err: Error) => {
          this.error.set(err.message);
          this.isLoading.set(false);
        }
      });

    this.githubService
      .getCommitFrequency(owner, repo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => this.commitFrequency.set(result),
        error: () => this.commitFrequency.set([])
      });
  }
}
