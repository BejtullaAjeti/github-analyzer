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

@Component({
  selector: 'app-repo-analyzer',
  standalone: true,
  imports: [RepoHealthComponent, LanguageChartComponent, CommitFrequencyChartComponent, ContributorsComponent],
  template: `
    @if (isLoading()) {
      <div class="loading-placeholder">Loading...</div>
    }

    @if (error()) {
      <div class="error-placeholder">{{ error() }}</div>
    }

    @if (hasResults()) {
      <div class="repo-header">
        <div class="repo-fullname">{{ repoDetail()!.full_name }}</div>
        @if (repoDetail()!.description) {
          <div class="repo-desc">{{ repoDetail()!.description }}</div>
        }
        <div class="repo-stats-row">
          <span>★ {{ repoDetail()!.stargazers_count }}</span>
          <span>⑂ {{ repoDetail()!.forks_count }}</span>
          <span>{{ repoDetail()!.open_issues_count }} open issues</span>
          <span>{{ repoDetail()!.watchers_count }} watchers</span>
        </div>
      </div>

      <div class="repo-content">
        <app-commit-frequency-chart class="full-width" [data]="commitFrequency()" />
        <app-repo-health [health]="repoHealth()!" />
        <app-language-chart [languages]="languages()" [valueLabel]="'bytes'" />
        <app-contributors class="full-width" [contributors]="contributors()" />
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
