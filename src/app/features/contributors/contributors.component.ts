import { Component, computed, input } from '@angular/core';

import { ContributorSummary } from '../../shared/models/github.models';

const AVATAR_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='12' fill='%238b949e'/%3E%3C/svg%3E";

@Component({
  selector: 'app-contributors',
  standalone: true,
  imports: [],
  template: `
    <div class="pane">
      <div class="pane-title">
        <span>Contributors</span>
        <span class="pane-title-meta">{{ topContributors().length }}</span>
      </div>
      <ul class="contributor-list">
        @for (contributor of topContributors(); track contributor.login; let i = $index) {
          <li class="contributor-item">
            <span class="rank">{{ rank(i) }}</span>
            <img
              class="contributor-avatar"
              [src]="contributor.avatar_url"
              [alt]="contributor.login"
              (error)="onAvatarError($event)"
            />
            <a
              class="contributor-login"
              [href]="'https://github.com/' + contributor.login"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ contributor.login }}
            </a>
            <div class="contribution-bar-track">
              <div class="contribution-bar-fill" [style.width]="barWidth(contributor.contributions)"></div>
            </div>
            <span class="contribution-count">{{ contributor.contributions }}</span>
          </li>
        }
      </ul>
    </div>
  `,
  styleUrl: './contributors.component.scss'
})
export class ContributorsComponent {
  readonly contributors = input<ContributorSummary[] | null>([]);

  readonly topContributors = computed(() => (this.contributors() ?? []).slice(0, 10));
  readonly maxContributions = computed(() => this.topContributors()[0]?.contributions ?? 1);

  barWidth(count: number): string {
    const pct = (count / this.maxContributions()) * 100;
    return `${Math.max(pct, 2)}%`;
  }

  rank(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  onAvatarError(event: Event): void {
    (event.target as HTMLImageElement).src = AVATAR_FALLBACK;
  }
}
