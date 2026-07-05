import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  effect
} from '@angular/core';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  LinearScale,
  Tooltip
} from 'chart.js';

import { CommitFrequencyPoint } from '../../shared/models/github.models';
import { cssVar, themeVersion } from '../../shared/theme';

Chart.register(BarElement, BarController, CategoryScale, LinearScale, Tooltip);

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

@Component({
  selector: 'app-commit-frequency-chart',
  standalone: true,
  imports: [],
  template: `
    <div class="pane">
      <div class="pane-title"><span>Commit Frequency</span></div>
      <div class="pane-body">
        @if (data === 'computing') {
          <div class="empty-state">
            GitHub is still calculating commit stats for this repository — check back in a few minutes.
          </div>
        } @else if ((data ?? []).length === 0) {
          <div class="empty-state">No commit data available</div>
        } @else {
          <div class="canvas-container">
            <canvas #canvas></canvas>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './commit-frequency-chart.component.scss'
})
export class CommitFrequencyChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() data: CommitFrequencyPoint[] | 'computing' | null = [];

  @ViewChild('canvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;
  private renderFrame?: number;

  constructor() {
    effect(() => {
      themeVersion();
      if (this.chart) {
        this.chart.destroy();
        this.chart = this.createChart();
      }
    });
  }

  ngAfterViewInit(): void {
    this.renderFrame = requestAnimationFrame(() => {
      this.chart = this.createChart();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.chart?.destroy();
      this.chart = this.createChart();
    }
  }

  ngOnDestroy(): void {
    if (this.renderFrame !== undefined) {
      cancelAnimationFrame(this.renderFrame);
    }
    this.chart?.destroy();
  }

  private createChart(): Chart | undefined {
    if (this.data === 'computing' || !this.data || this.data.length === 0 || !this.canvasRef) {
      return undefined;
    }

    const points = this.data;
    const labels = points.map(point => dateFormatter.format(new Date(point.week_start)));
    const values = points.map(point => point.count);
    const mutedColor = cssVar('--color-fg-muted');

    return new Chart(this.canvasRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: cssVar('--color-accent-fg'),
            borderRadius: 2,
            borderSkipped: false
          }
        ]
      },
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false },
            ticks: { maxTicksLimit: 15, font: { size: 11, family: 'var(--font-mono)' }, color: mutedColor }
          },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, precision: 0, font: { size: 11, family: 'var(--font-mono)' }, color: mutedColor },
            grid: { color: cssVar('--color-border-muted') }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: cssVar('--color-canvas-inset'),
            borderColor: cssVar('--color-border-default'),
            borderWidth: 1,
            titleColor: cssVar('--color-fg-default'),
            bodyColor: mutedColor
          }
        }
      }
    });
  }
}
