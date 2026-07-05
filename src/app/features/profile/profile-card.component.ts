import { Component, computed, input } from '@angular/core';

import { GithubUser } from '../../shared/models/github.models';

@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [],
  template: `
    <div class="pane profile-pane">
      <div class="profile-main">
        <img class="avatar" [src]="user().avatar_url" [alt]="user().login" />

        <div class="profile-id">
          <a class="profile-name" [href]="user().html_url" target="_blank" rel="noopener noreferrer">
            {{ user().name || user().login }}
          </a>
          <div class="profile-login">&#64;{{ user().login }}</div>
        </div>

        <div class="profile-stats">
          <div class="hero-stat">
            <span class="hero-count">{{ formatCount(user().followers) }}</span>
            <span class="hero-label">followers</span>
          </div>
          <div class="stat-chips">
            <span class="stat-chip"><span class="chip-count">{{ formatCount(user().following) }}</span> following</span>
            <span class="stat-chip"><span class="chip-count">{{ formatCount(user().public_repos) }}</span> repos</span>
          </div>
        </div>
      </div>

      @if (user().bio) {
        <p class="profile-bio">{{ user().bio }}</p>
      }

      <div class="profile-meta-row">
        @if (user().location) {
          <span class="meta-item">
            <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M8 0a5 5 0 0 0-5 5c0 4 5 11 5 11s5-7 5-11a5 5 0 0 0-5-5Zm0 7.2A2.2 2.2 0 1 1 8 2.8a2.2 2.2 0 0 1 0 4.4Z"/></svg>
            {{ user().location }}
          </span>
        }
        @if (user().company) {
          <span class="meta-item">
            <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M2 1h7v3h5v11H2V1Zm2 2v10h3V9h2v4h3V6H9V3H4Z"/></svg>
            {{ user().company }}
          </span>
        }
        @if (blogUrl()) {
          <span class="meta-item">
            <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M7.8 10.2 5.6 12.4a2 2 0 0 1-2.8-2.8l2.2-2.2a1 1 0 0 1 1.4 1.4l-2.2 2.2a.2.2 0 0 0 0 .3.2.2 0 0 0 .3 0l2.2-2.2a1 1 0 0 1 1.4 1.4Zm4.4-4.4-2.2 2.2a1 1 0 0 1-1.4-1.4l2.2-2.2a.2.2 0 0 0 0-.3.2.2 0 0 0-.3 0L8.3 6.3A1 1 0 1 1 6.9 4.9l2.2-2.2a2 2 0 0 1 2.8 2.8Z"/></svg>
            <a class="meta-link" [href]="blogUrl()" target="_blank" rel="noopener noreferrer">{{ user().blog }}</a>
          </span>
        }
        <span class="meta-item member-since">Member since {{ memberSince() }}</span>
      </div>
    </div>
  `,
  styleUrl: './profile-card.component.scss'
})
export class ProfileCardComponent {
  readonly user = input.required<GithubUser>();

  readonly memberSince = computed(() => new Date(this.user().created_at).getFullYear());

  readonly blogUrl = computed(() => {
    const blog = this.user().blog;
    if (!blog) {
      return null;
    }
    return /^https?:\/\//.test(blog) ? blog : `https://${blog}`;
  });

  formatCount(value: number): string {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return `${value}`;
  }
}
