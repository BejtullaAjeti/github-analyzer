import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { GithubService } from './core/services/github.service';
import { UserSearchResult, RepoSearchResult } from './shared/models/github.models';
import { AnalyzerComponent } from './features/analyzer/analyzer.component';
import { RepoAnalyzerComponent } from './features/repo-analyzer/repo-analyzer.component';
import { SearchComponent } from './features/search/search.component';
import { SearchResultsComponent } from './features/search-results/search-results.component';

const THEME_KEY = 'theme';

@Component({
  selector: 'app-root',
  imports: [AnalyzerComponent, RepoAnalyzerComponent, SearchComponent, SearchResultsComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly githubService = inject(GithubService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly title = signal('github-analyzer');

  readonly mode = signal<'results' | 'user' | 'repo'>('results');
  readonly searchMode = signal<'user' | 'repo'>('user');
  readonly currentQuery = signal('');
  readonly lastQuery = signal('');

  readonly userResults = signal<UserSearchResult[]>([]);
  readonly repoResults = signal<RepoSearchResult[]>([]);
  readonly isSearching = signal(false);
  readonly searchError = signal<string | null>(null);

  readonly isLightTheme = signal(false);
  readonly themeToggleLabel = computed(() => (this.isLightTheme() ? 'Dark' : 'Light'));

  ngOnInit(): void {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'light') {
      this.isLightTheme.set(true);
      document.documentElement.classList.add('light');
    }

    const q = this.route.snapshot.queryParamMap.get('q');
    const type = this.route.snapshot.queryParamMap.get('type');
    if (q) {
      this.lastQuery.set(q);
      this.runSearch(q, type === 'repo' ? 'repo' : 'user');
    }
  }

  toggleTheme(): void {
    const next = !this.isLightTheme();
    this.isLightTheme.set(next);
    document.documentElement.classList.toggle('light', next);
    localStorage.setItem(THEME_KEY, next ? 'light' : 'dark');
  }

  onSearch(event: { query: string; mode: 'user' | 'repo' }): void {
    this.lastQuery.set(event.query);
    this.router.navigate([], {
      queryParams: { q: event.query, type: event.mode },
      queryParamsHandling: 'merge'
    });
    this.runSearch(event.query, event.mode);
  }

  onSelectResult(identifier: string): void {
    this.currentQuery.set(identifier);
    this.mode.set(this.searchMode() === 'user' ? 'user' : 'repo');
  }

  backToResults(): void {
    this.mode.set('results');
  }

  private runSearch(query: string, searchMode: 'user' | 'repo'): void {
    this.searchMode.set(searchMode);
    this.isSearching.set(true);
    this.searchError.set(null);

    if (searchMode === 'user') {
      this.githubService
        .searchUsers(query)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: results => {
            this.userResults.set(results);
            this.isSearching.set(false);
            this.mode.set('results');
          },
          error: (err: Error) => {
            this.searchError.set(err.message);
            this.isSearching.set(false);
            this.mode.set('results');
          }
        });
    } else {
      this.githubService
        .searchRepos(query)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: results => {
            this.repoResults.set(results);
            this.isSearching.set(false);
            this.mode.set('results');
          },
          error: (err: Error) => {
            this.searchError.set(err.message);
            this.isSearching.set(false);
            this.mode.set('results');
          }
        });
    }
  }
}
