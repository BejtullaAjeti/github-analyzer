import { Component, EventEmitter, Output, computed, input } from '@angular/core';

import { UserSearchResult, RepoSearchResult } from '../../shared/models/github.models';
import { languageColor } from '../../shared/language-colors';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader.component';
import { ErrorMessageComponent } from '../../shared/components/error-message.component';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [SkeletonLoaderComponent, ErrorMessageComponent],
  template: `
    @if (isLoading()) {
      <app-skeleton-loader mode="user" />
    }

    @if (error()) {
      <app-error-message [message]="error()!" />
    }

    @if (!isLoading() && !error()) {
      @if (activeResultsCount() === 0) {
        <p class="empty-state">No results found</p>
      } @else if (mode() === 'user') {
        <div class="card">
          @for (user of userResults(); track user.login) {
            <div
              class="result-row"
              role="button"
              tabindex="0"
              (click)="selectUser(user.login)"
              (keydown.enter)="selectUser(user.login)"
            >
              <img class="result-avatar" [src]="user.avatar_url" [alt]="user.login" />
              <span class="result-login">{{ user.login }}</span>
              @if (user.type === 'Organization') {
                <span class="type-badge">Organization</span>
              }
            </div>
          }
        </div>
      } @else {
        <div class="card">
          @for (repo of repoResults(); track repo.full_name) {
            <div
              class="result-row"
              role="button"
              tabindex="0"
              (click)="selectRepo(repo.full_name)"
              (keydown.enter)="selectRepo(repo.full_name)"
            >
              <div class="result-main">
                <div class="result-fullname">{{ repo.full_name }}</div>
                @if (repo.description) {
                  <p class="result-description">{{ repo.description }}</p>
                } @else {
                  <p class="result-description empty">No description</p>
                }
              </div>
              <div class="result-meta">
                <span class="meta-stat">
                  <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M8 .3l2.2 4.9 5.3.6-4 3.7 1.1 5.3L8 12.2l-4.6 2.6 1.1-5.3-4-3.7 5.3-.6L8 .3z"/></svg>
                  <span class="meta-count">{{ repo.stargazers_count }}</span>
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
        </div>
      }
    }
  `,
  styleUrl: './search-results.component.scss'
})
export class SearchResultsComponent {
  readonly mode = input.required<'user' | 'repo'>();
  readonly userResults = input<UserSearchResult[]>([]);
  readonly repoResults = input<RepoSearchResult[]>([]);
  readonly isLoading = input(false);
  readonly error = input<string | null>(null);

  @Output() select = new EventEmitter<string>();

  readonly activeResultsCount = computed(() =>
    this.mode() === 'user' ? this.userResults().length : this.repoResults().length
  );

  readonly languageColor = languageColor;

  selectUser(login: string): void {
    this.select.emit(login);
  }

  selectRepo(fullName: string): void {
    this.select.emit(fullName);
  }
}
