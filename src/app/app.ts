import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnalyzerComponent } from './features/analyzer/analyzer.component';
import { RepoAnalyzerComponent } from './features/repo-analyzer/repo-analyzer.component';
import { SearchComponent } from './features/search/search.component';

const THEME_KEY = 'theme';

@Component({
  selector: 'app-root',
  imports: [AnalyzerComponent, RepoAnalyzerComponent, SearchComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly title = signal('github-analyzer');

  readonly mode = signal<'user' | 'repo'>('user');
  readonly currentQuery = signal('');
  readonly isLightTheme = signal(false);

  readonly themeToggleLabel = computed(() => (this.isLightTheme() ? 'Dark' : 'Light'));

  ngOnInit(): void {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'light') {
      this.isLightTheme.set(true);
      document.documentElement.classList.add('light');
    }

    const q = this.route.snapshot.queryParamMap.get('q');
    if (q) {
      this.currentQuery.set(q);
      this.mode.set(q.includes('/') ? 'repo' : 'user');
    }
  }

  toggleTheme(): void {
    const next = !this.isLightTheme();
    this.isLightTheme.set(next);
    document.documentElement.classList.toggle('light', next);
    localStorage.setItem(THEME_KEY, next ? 'light' : 'dark');
  }

  onSearch(event: { query: string; mode: 'user' | 'repo' }): void {
    this.mode.set(event.mode);
    this.currentQuery.set(event.query);
    this.router.navigate([], { queryParams: { q: event.query }, queryParamsHandling: 'merge' });
  }
}
