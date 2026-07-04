import { Component, DestroyRef, EventEmitter, Output, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { GithubService } from '../../core/services/github.service';
import { GithubUser, ReposResponse, ActivityPoint } from '../../shared/models/github.models';
import { SearchComponent } from '../search/search.component';
import { ProfileCardComponent } from '../profile/profile-card.component';
import { ReposListComponent } from '../repos/repos-list.component';
import { LanguageChartComponent } from '../charts/language-chart.component';
import { ActivityChartComponent } from '../charts/activity-chart.component';

@Component({
  selector: 'app-analyzer',
  standalone: true,
  imports: [SearchComponent, ProfileCardComponent, ReposListComponent, LanguageChartComponent, ActivityChartComponent],
  template: `
    <app-search (search)="onSearch($event)" />

    @if (isLoading()) {
      <div class="loading-placeholder">Loading...</div>
    }

    @if (error()) {
      <div class="error-placeholder">{{ error() }}</div>
    }

    @if (hasResults()) {
      <div class="results-grid">
        <app-profile-card [user]="profile()!" />
        <div class="right-column">
          <app-repos-list [reposData]="repos()!" />
          <app-language-chart [languages]="repos()!.languages" [valueLabel]="'repos'" />
          <app-activity-chart [activity]="activity()" />
          <!-- <app-commit-frequency-chart /> -->
        </div>
      </div>
    }
  `,
  styleUrl: './analyzer.component.scss'
})
export class AnalyzerComponent {
  private readonly githubService = inject(GithubService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly profile = signal<GithubUser | null>(null);
  readonly repos = signal<ReposResponse | null>(null);
  readonly activity = signal<ActivityPoint[]>([]);

  readonly hasResults = computed(() => this.profile() !== null);

  @Output() repoSearch = new EventEmitter<string>();

  onSearch(event: { query: string; mode: 'user' | 'repo' }): void {
    if (event.mode === 'repo') {
      this.repoSearch.emit(event.query);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.profile.set(null);
    this.repos.set(null);
    this.activity.set([]);

    forkJoin({
      profile: this.githubService.getProfile(event.query),
      repos: this.githubService.getRepos(event.query),
      activity: this.githubService.getActivity(event.query)
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
