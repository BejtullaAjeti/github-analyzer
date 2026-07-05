import { Component, EventEmitter, Input, OnInit, Output, computed, input, signal } from '@angular/core';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [],
  template: `
    <div class="search-tabs">
      <button
        type="button"
        class="tab-button"
        [class.active]="mode() === 'user'"
        (click)="modeChange.emit('user')"
      >
        Users
      </button>
      <button
        type="button"
        class="tab-button"
        [class.active]="mode() === 'repo'"
        (click)="modeChange.emit('repo')"
      >
        Repositories
      </button>
    </div>
    <div class="search-row">
      <span class="prompt-glyph">&gt;</span>
      <input
        type="text"
        class="search-input"
        [placeholder]="placeholder()"
        [value]="query()"
        (input)="query.set($any($event.target).value)"
        (keydown.enter)="onSearch()"
      />
    </div>
    <button
      type="button"
      class="search-button"
      [disabled]="query().trim().length === 0"
      (click)="onSearch()"
    >
      Analyze
    </button>
  `,
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit {
  readonly mode = input<'user' | 'repo'>('user');
  @Output() modeChange = new EventEmitter<'user' | 'repo'>();

  @Input() initialValue = '';

  readonly query = signal('');

  readonly placeholder = computed(() =>
    this.mode() === 'repo' ? 'repository name' : 'username'
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
    this.search.emit({ query, mode: this.mode() });
  }
}
