import { Component, computed, input } from '@angular/core';

import { ReposResponse } from '../../shared/models/github.models';
import { languageColor } from '../../shared/language-colors';

@Component({
  selector: 'app-repos-list',
  standalone: true,
  imports: [],
  template: `
    <div class="pane">
      <div class="pane-title">
        <span>Repositories</span>
        <span class="pane-title-meta">{{ topRepos().length }}</span>
      </div>
      <div class="pane-body">
        @if (topRepos().length === 0) {
          <p class="empty-state">No repositories found</p>
        } @else {
          @for (repo of topRepos(); track repo.html_url) {
            <div class="repo-item">
              <a class="repo-name" [href]="repo.html_url" target="_blank" rel="noopener noreferrer">{{ repo.name }}</a>

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
        }
      </div>
    </div>
  `,
  styleUrl: './repos-list.component.scss'
})
export class ReposListComponent {
  readonly reposData = input.required<ReposResponse>();

  readonly topRepos = computed(() => this.reposData().top_repos ?? []);

  readonly languageColor = languageColor;
}
