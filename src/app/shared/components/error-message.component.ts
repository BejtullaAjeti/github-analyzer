import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [],
  template: `
    <div class="error-message">
      <svg class="error-icon" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M8 1.5 15 14H1L8 1.5Z" stroke-linejoin="round" />
        <path d="M8 6v3.5" stroke-linecap="round" />
        <circle cx="8" cy="12" r="0.75" fill="currentColor" stroke="none" />
      </svg>
      <span>{{ message }}</span>
    </div>
  `,
  styles: [
    `
    .error-message {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 12px 16px;
      background: color-mix(in srgb, var(--color-danger-fg) 10%, transparent);
      border: 1px solid color-mix(in srgb, var(--color-danger-fg) 40%, transparent);
      border-radius: 6px;
      font-size: 13px;
      color: var(--color-fg-default);
    }

    .error-icon {
      flex-shrink: 0;
      color: var(--color-danger-fg);
    }
    `
  ]
})
export class ErrorMessageComponent {
  @Input() message!: string;
}
