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

import { ActivityPoint } from '../../shared/models/github.models';
import { cssVar, themeVersion } from '../../shared/theme';

Chart.register(BarElement, BarController, CategoryScale, LinearScale, Tooltip);

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

@Component({
  selector: 'app-activity-chart',
  standalone: true,
  imports: [],
  template: `
    <div class="pane">
      <div class="pane-title"><span>Activity</span></div>
      <div class="pane-body">
        @if (recentActivity().length === 0) {
          <div class="empty-state">No recent activity</div>
        } @else {
          <div class="canvas-container">
            <canvas #canvas></canvas>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './activity-chart.component.scss'
})
export class ActivityChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() activity: ActivityPoint[] | null = [];

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
    if (changes['activity']) {
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

  recentActivity(): ActivityPoint[] {
    const cutoff = Date.now() - NINETY_DAYS_MS;
    return (this.activity ?? []).filter(point => new Date(point.date).getTime() >= cutoff);
  }

  private createChart(): Chart | undefined {
    const points = this.recentActivity();
    if (points.length === 0 || !this.canvasRef) {
      return undefined;
    }

    const labels = points.map(point => dateFormatter.format(new Date(point.date)));
    const data = points.map(point => point.count);
    const mutedColor = cssVar('--color-fg-muted');

    return new Chart(this.canvasRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data,
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
