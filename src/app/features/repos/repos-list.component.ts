import { Component, DestroyRef, EventEmitter, Output, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { GithubService } from '../../core/services/github.service';
import { ReposResponse, Repository } from '../../shared/models/github.models';
import { languageColor } from '../../shared/language-colors';

@Component({
  selector: 'app-repos-list',
  standalone: true,
  imports: [],
  template: `
    <div class="pane">
      <div class="pane-title">
        <span>Repositories</span>
        <span class="pane-title-meta">{{ repos().length }}</span>
      </div>
      <div class="pane-body">
        @if (repos().length === 0) {
          <p class="empty-state">No repositories found</p>
        } @else {
          @for (repo of repos(); track repo.html_url) {
            <div class="repo-item">
              <div class="repo-name-row">
                <button type="button" class="repo-name" (click)="onViewRepo(repo)">{{ repo.name }}</button>
                <a
                  class="external-link-btn"
                  [href]="repo.html_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  [attr.aria-label]="'Open ' + repo.name + ' on GitHub'"
                  (click)="$event.stopPropagation()"
                >
                  <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M10.604 1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.75.75 0 0 1-1.06-1.06l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1ZM3.75 2A1.75 1.75 0 0 0 2 3.75v8.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0 0 14 12.25v-3.5a.75.75 0 0 0-1.5 0v3.5a.25.25 0 0 1-.25.25h-8.5a.25.25 0 0 1-.25-.25v-8.5a.25.25 0 0 1 .25-.25h3.5a.75.75 0 0 0 0-1.5h-3.5Z"/></svg>
                </a>
              </div>

              @if (repo.description) {
                <p class="repo-description">{{ repo.description }}</p>
              }

              <div class="meta-row">
                <span class="meta-stat">
                  <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M8 .3l2.2 4.9 5.3.6-4 3.7 1.1 5.3L8 12.2l-4.6 2.6 1.1-5.3-4-3.7 5.3-.6L8 .3z"/></svg>
                  <span class="meta-count">{{ repo.stargazers_count }}</span>
                </span>
                <span class="meta-stat">
                  <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M5 3.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm5.5 1.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM6.5 5v1.5a1.5 1.5 0 0 0 1.5 1.5h.5v3.75a1.5 1.5 0 1 0 1 0V8h.5a1.5 1.5 0 0 0 1.5-1.5V5H10v1.5a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V5H6.5Z"/></svg>
                  <span class="meta-count">{{ repo.forks_count }}</span>
                </span>
                @if (repo.language) {
                  <span class="meta-stat">
                    <span class="language-dot" [style.background-color]="languageColor(repo.language)"></span>
                    {{ repo.language }}
                  </span>
                }
              </div>
            </div>
          }

          @if (hasMore()) {
            <button type="button" class="load-more-btn" [disabled]="loadingMore()" (click)="loadMore()">
              {{ loadingMore() ? 'Loading...' : 'Load More' }}
            </button>
          }
        }
      </div>
    </div>
  `,
  styleUrl: './repos-list.component.scss'
})
export class ReposListComponent {
  private readonly githubService = inject(GithubService);
  private readonly destroyRef = inject(DestroyRef);

  readonly reposData = input.required<ReposResponse>();
  readonly username = input.required<string>();

  @Output() viewRepo = new EventEmitter<string>();

  readonly repos = signal<Repository[]>([]);
  readonly hasMore = signal(false);
  readonly offset = signal(0);
  readonly loadingMore = signal(false);

  readonly languageColor = languageColor;

  constructor() {
    effect(() => {
      const data = this.reposData();
      this.repos.set(data.top_repos ?? []);
      this.hasMore.set(data.has_more ?? false);
      this.offset.set(data.offset ?? data.top_repos?.length ?? 0);
      this.loadingMore.set(false);
    });
  }

  loadMore(): void {
    if (this.loadingMore() || !this.hasMore()) {
      return;
    }
    this.loadingMore.set(true);
    this.githubService
      .getRepos(this.username(), this.offset())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.repos.update(current => [...current, ...(response.top_repos ?? [])]);
          this.hasMore.set(response.has_more ?? false);
          this.offset.set(response.offset ?? this.repos().length);
          this.loadingMore.set(false);
        },
        error: () => {
          this.loadingMore.set(false);
        }
      });
  }

  onViewRepo(repo: Repository): void {
    this.viewRepo.emit(this.repoFullName(repo));
  }

  private repoFullName(repo: Repository): string {
    try {
      return new URL(repo.html_url).pathname.replace(/^\//, '');
    } catch {
      return `${this.username()}/${repo.name}`;
    }
  }
}
