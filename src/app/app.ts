import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnalyzerComponent } from './features/analyzer/analyzer.component';
import { RepoAnalyzerComponent } from './features/repo-analyzer/repo-analyzer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AnalyzerComponent, RepoAnalyzerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('github-analyzer');

  readonly mode = signal<'user' | 'repo'>('user');
  readonly currentQuery = signal('');

  onRepoSearch(query: string): void {
    this.mode.set('repo');
    this.currentQuery.set(query);
  }
}
