import { Component, EventEmitter, Output, computed, signal } from '@angular/core';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [],
  template: `
    <div class="search-row">
      <input
        type="text"
        class="search-input"
        placeholder="Enter a username or owner/repo (e.g. torvalds or golang/go)"
        [value]="username()"
        (input)="username.set($any($event.target).value)"
        (keydown.enter)="onSearch()"
      />
      <button
        type="button"
        class="search-button"
        [disabled]="username().trim().length === 0"
        (click)="onSearch()"
      >
        Search
      </button>
    </div>
    @if (username().length > 0) {
      <div class="mode-badge">{{ isRepoMode() ? 'Repo search' : 'Username search' }}</div>
    }
  `,
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  readonly username = signal('');
  readonly isRepoMode = computed(() => this.username().includes('/'));

  @Output() search = new EventEmitter<{ query: string; mode: 'user' | 'repo' }>();

  onSearch(): void {
    const query = this.username().trim();
    if (!query) {
      return;
    }
    this.search.emit({ query, mode: this.isRepoMode() ? 'repo' : 'user' });
  }
}
