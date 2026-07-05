import { Component, EventEmitter, Input, OnInit, Output, computed, signal } from '@angular/core';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [],
  template: `
    <div class="search-tabs">
      <button
        type="button"
        class="tab-button"
        [class.active]="searchMode() === 'user'"
        (click)="searchMode.set('user')"
      >
        Users
      </button>
      <button
        type="button"
        class="tab-button"
        [class.active]="searchMode() === 'repo'"
        (click)="searchMode.set('repo')"
      >
        Repositories
      </button>
    </div>
    <div class="search-row">
      <input
        type="text"
        class="search-input"
        [placeholder]="placeholder()"
        [value]="query()"
        (input)="query.set($any($event.target).value)"
        (keydown.enter)="onSearch()"
      />
      <button
        type="button"
        class="search-button"
        [disabled]="query().trim().length === 0"
        (click)="onSearch()"
      >
        Analyze
      </button>
    </div>
  `,
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit {
  @Input() initialValue = '';

  readonly searchMode = signal<'user' | 'repo'>('user');
  readonly query = signal('');

  readonly placeholder = computed(() =>
    this.searchMode() === 'repo' ? 'Enter a repository name' : 'Enter a GitHub username'
  );

  @Output() search = new EventEmitter<{ query: string; mode: 'user' | 'repo' }>();

  ngOnInit(): void {
    if (this.initialValue) {
      this.query.set(this.initialValue);
    }
  }

  onSearch(): void {
    const query = this.query().trim();
    if (!query) {
      return;
    }
    this.search.emit({ query, mode: this.searchMode() });
  }
}
