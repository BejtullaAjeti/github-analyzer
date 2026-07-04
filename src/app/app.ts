import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnalyzerComponent } from './features/analyzer/analyzer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,AnalyzerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('github-analyzer');
}
