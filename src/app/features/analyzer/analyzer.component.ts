import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { GithubService } from '../../core/services/github.service';
import { GithubUser, ReposResponse, ActivityPoint } from '../../shared/models/github.models';
import { ProfileCardComponent } from '../profile/profile-card.component';
import { ReposListComponent } from '../repos/repos-list.component';
import { LanguageChartComponent } from '../charts/language-chart.component';
import { ActivityChartComponent } from '../charts/activity-chart.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader.component';
import { ErrorMessageComponent } from '../../shared/components/error-message.component';

@Component({
  selector: 'app-analyzer',
  standalone: true,
  imports: [
    ProfileCardComponent,
    ReposListComponent,
    LanguageChartComponent,
    ActivityChartComponent,
    SkeletonLoaderComponent,
    ErrorMessageComponent
  ],
  template: `
    @if (isLoading()) {
      <app-skeleton-loader mode="user" />
    }

    @if (error()) {
      <app-error-message [message]="error()!" />
    }

    @if (hasResults()) {
      <div class="analyzer-stack">
        <app-profile-card [user]="profile()!" />
        <app-repos-list [reposData]="repos()!" />
        <div class="chart-row">
          <app-language-chart [languages]="repos()!.languages" [valueLabel]="'repos'" />
          <app-activity-chart [activity]="activity()" />
        </div>
      </div>
    }
  `,
  styleUrl: './analyzer.component.scss'
})
export class AnalyzerComponent {
  private readonly githubService = inject(GithubService);
  private readonly destroyRef = inject(DestroyRef);

  readonly query = input.required<string>();

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly profile = signal<GithubUser | null>(null);
  readonly repos = signal<ReposResponse | null>(null);
  readonly activity = signal<ActivityPoint[]>([]);

  readonly hasResults = computed(() => this.profile() !== null);

  constructor() {
    effect(() => {
      const query = this.query();
      if (query) {
        this.loadData(query);
      }
    });
  }

  private loadData(username: string): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.profile.set(null);
    this.repos.set(null);
    this.activity.set([]);

    forkJoin({
      profile: this.githubService.getProfile(username),
      repos: this.githubService.getRepos(username),
      activity: this.githubService.getActivity(username)
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ profile, repos, activity }) => {
          this.profile.set(profile);
          this.repos.set(repos);
          this.activity.set(activity);
          this.isLoading.set(false);
        },
        error: (err: Error) => {
          this.error.set(err.message);
          this.isLoading.set(false);
        }
      });
  }
}
