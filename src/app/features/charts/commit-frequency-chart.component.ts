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

import { CommitFrequencyPoint } from '../../shared/models/github.models';

Chart.register(BarElement, BarController, CategoryScale, LinearScale, Tooltip);

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

@Component({
  selector: 'app-commit-frequency-chart',
  standalone: true,
  imports: [],
  template: `
    <div class="chart-wrapper">
      <div class="chart-header">Commit Frequency</div>
      @if (data === 'computing') {
        <div class="empty-state">
          GitHub is still calculating commit stats for this repository — check back in a few minutes.
        </div>
      } @else if (data.length === 0) {
        <div class="empty-state">No commit data available</div>
      } @else {
        <canvas #canvas></canvas>
      }
    </div>
  `,
  styleUrl: './commit-frequency-chart.component.scss'
})
export class CommitFrequencyChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() data: CommitFrequencyPoint[] | 'computing' = [];

  @ViewChild('canvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  ngAfterViewInit(): void {
    this.chart = this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.chart?.destroy();
      this.chart = this.createChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private createChart(): Chart | undefined {
    if (this.data === 'computing' || this.data.length === 0 || !this.canvasRef) {
      return undefined;
    }

    const points = this.data;
    const labels = points.map(point => dateFormatter.format(new Date(point.week_start)));
    const values = points.map(point => point.count);

    return new Chart(this.canvasRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data: values,
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
