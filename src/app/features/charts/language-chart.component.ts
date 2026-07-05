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
  ArcElement,
  Chart,
  DoughnutController,
  Legend,
  Tooltip
} from 'chart.js';

import { languageColor } from '../../shared/language-colors';

Chart.register(ArcElement, DoughnutController, Tooltip, Legend);

const TOP_N = 7;

@Component({
  selector: 'app-language-chart',
  standalone: true,
  imports: [],
  template: `
    <div class="chart-wrapper">
      <div class="chart-header">Languages</div>
      <div class="canvas-container">
        <canvas #canvas></canvas>
      </div>
    </div>
  `,
  styleUrl: './language-chart.component.scss'
})
export class LanguageChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() languages: Record<string, number> | null = {};
  @Input() valueLabel = 'repos';

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;
  private renderFrame?: number;

  ngAfterViewInit(): void {
    this.renderFrame = requestAnimationFrame(() => {
      this.chart = this.createChart();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.chart) {
      return;
    }
    if (changes['languages'] || changes['valueLabel']) {
      this.chart.destroy();
      this.chart = this.createChart();
    }
  }

  ngOnDestroy(): void {
    if (this.renderFrame !== undefined) {
      cancelAnimationFrame(this.renderFrame);
    }
    this.chart?.destroy();
  }

  private groupedEntries(): [string, number][] {
    const sorted = Object.entries(this.languages ?? {}).sort(([, a], [, b]) => b - a);
    const top = sorted.slice(0, TOP_N);
    const rest = sorted.slice(TOP_N);
    const otherTotal = rest.reduce((sum, [, value]) => sum + value, 0);
    return otherTotal > 0 ? [...top, ['Other', otherTotal]] : top;
  }

  private createChart(): Chart {
    const entries = this.groupedEntries();
    const labels = entries.map(([name]) => name);
    const data = entries.map(([, value]) => value);
    const colors = entries.map(([name]) => (name === 'Other' ? '#8b949e' : languageColor(name)));
    const valueLabel = this.valueLabel;

    return new Chart(this.canvasRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors,
            borderColor: '#0d1117',
            borderWidth: 2
          }
        ]
      },
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: { size: 12 },
              color: getComputedStyle(document.documentElement).getPropertyValue('--color-fg-default')
            }
          },
          tooltip: {
            backgroundColor: '#161b22',
            borderColor: '#30363d',
            borderWidth: 1,
            titleColor: '#e6edf3',
            bodyColor: '#8b949e',
            callbacks: {
              label: ctx => `${ctx.label}: ${ctx.parsed.toLocaleString()} ${valueLabel}`
            }
          }
        }
      }
    });
  }
}
