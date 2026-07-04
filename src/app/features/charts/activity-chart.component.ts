import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild
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

Chart.register(BarElement, BarController, CategoryScale, LinearScale, Tooltip);

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

@Component({
  selector: 'app-activity-chart',
  standalone: true,
  imports: [],
  template: `
    <div class="chart-wrapper">
      <div class="chart-header">Activity</div>
      @if (recentActivity().length === 0) {
        <div class="empty-state">No recent activity</div>
      } @else {
        <canvas #canvas></canvas>
      }
    </div>
  `,
  styleUrl: './activity-chart.component.scss'
})
export class ActivityChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() activity: ActivityPoint[] = [];

  @ViewChild('canvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  ngAfterViewInit(): void {
    this.chart = this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activity']) {
      this.chart?.destroy();
      this.chart = this.createChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  recentActivity(): ActivityPoint[] {
    const cutoff = Date.now() - NINETY_DAYS_MS;
    return this.activity.filter(point => new Date(point.date).getTime() >= cutoff);
  }

  private createChart(): Chart | undefined {
    const points = this.recentActivity();
    if (points.length === 0 || !this.canvasRef) {
      return undefined;
    }

    const labels = points.map(point => dateFormatter.format(new Date(point.date)));
    const data = points.map(point => point.count);

    return new Chart(this.canvasRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: '#58a6ff',
            borderRadius: 2,
            borderSkipped: false
          }
        ]
      },
      options: {
        animation: false,
        scales: {
          x: {
            grid: { display: false },
            ticks: { maxTicksLimit: 15, font: { size: 11, family: 'var(--font-mono)' }, color: '#8b949e' }
          },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, precision: 0, font: { size: 11, family: 'var(--font-mono)' }, color: '#8b949e' },
            grid: { color: '#21262d' }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#161b22',
            borderColor: '#30363d',
            borderWidth: 1,
            titleColor: '#e6edf3',
            bodyColor: '#8b949e'
          }
        }
      }
    });
  }
}
