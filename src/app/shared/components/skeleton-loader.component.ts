import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [],
  template: `
    @if (mode === 'user') {
      <div class="skeleton-block header-block profile-block"></div>
      <div class="skeleton-block header-block"></div>
      <div class="skeleton-row">
        <div class="skeleton-block"></div>
        <div class="skeleton-block"></div>
      </div>
    } @else {
      <div class="skeleton-block header-block"></div>
      <div class="skeleton-row">
        <div class="skeleton-block"></div>
        <div class="skeleton-block"></div>
      </div>
    }
  `,
  styles: [
    `
    .skeleton-block {
      background: var(--color-border-muted);
      border-radius: var(--radius-sm);
      animation: shimmer 1.4s ease-in-out infinite;
      flex: 1;
      height: 220px;
    }

    .profile-block {
      height: 100px;
    }

    .header-block {
      height: 80px;
      margin-bottom: 16px;
    }

    .skeleton-row {
      display: flex;
      gap: 16px;
    }

    @keyframes shimmer {
      0% { opacity: 1; }
      50% { opacity: 0.4; }
      100% { opacity: 1; }
    }
    `
  ]
})
export class SkeletonLoaderComponent {
  @Input() mode: 'user' | 'repo' = 'user';
}
