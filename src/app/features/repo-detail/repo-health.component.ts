import { Component, Input } from '@angular/core';

import { RepoHealth } from '../../shared/models/github.models';

@Component({
  selector: 'app-repo-health',
  standalone: true,
  imports: [],
  template: `
    <div class="health-grid">
      <div class="health-cell">
        <div class="health-label">Last Commit</div>
        <div class="health-value">{{ relativeTime(health.last_commit_at) }}</div>
      </div>
      <div class="health-cell">
        <div class="health-label">Open Issues</div>
        <div class="health-value" [style.color]="issueColor(health.open_issues)">{{ health.open_issues }}</div>
      </div>
      <div class="health-cell">
        <div class="health-label">Stars</div>
        <div class="health-value">{{ health.stars }}</div>
      </div>
      <div class="health-cell">
        <div class="health-label">Watchers</div>
        <div class="health-value">{{ health.watchers }}</div>
      </div>
    </div>
    <div class="trend-note">{{ health.stars_trend_note }}</div>
  `,
  styleUrl: './repo-health.component.scss'
})
export class RepoHealthComponent {
  @Input() health!: RepoHealth;

  relativeTime(dateStr: string): string {
    const diffSeconds = (Date.now() - new Date(dateStr).getTime()) / 1000;

    if (diffSeconds < 60) {
      return 'just now';
    }
    if (diffSeconds < 3600) {
      return `${Math.floor(diffSeconds / 60)} minutes ago`;
    }
    if (diffSeconds < 86400) {
      return `${Math.floor(diffSeconds / 3600)} hours ago`;
    }
    if (diffSeconds < 2592000) {
      return `${Math.floor(diffSeconds / 86400)} days ago`;
    }
    if (diffSeconds < 31536000) {
      return `${Math.floor(diffSeconds / 2592000)} months ago`;
    }
    return `${Math.floor(diffSeconds / 31536000)} years ago`;
  }

  issueColor(count: number): string {
    if (count === 0) {
      return 'var(--color-success-fg)';
    }
    if (count <= 10) {
      return 'var(--color-fg-default)';
    }
    if (count <= 50) {
      return 'var(--color-attention-fg)';
    }
    return 'var(--color-danger-fg)';
  }
}
