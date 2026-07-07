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
  ArcElement,
  Chart,
  DoughnutController,
  Legend,
  Tooltip
} from 'chart.js';

import { languageColor } from '../../shared/language-colors';
import { cssVar, themeVersion } from '../../shared/theme';

Chart.register(ArcElement, DoughnutController, Tooltip, Legend);

const TOP_N = 7;

@Component({
  selector: 'app-language-chart',
  standalone: true,
  imports: [],
  template: `
    <div class="pane">
      <div class="pane-title"><span>Languages</span></div>
      <div class="pane-body">
        <div class="canvas-container">
          <canvas #canvas></canvas>
        </div>
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
    const otherColor = cssVar('--color-fg-muted');
    const colors = entries.map(([name]) => (name === 'Other' ? otherColor : languageColor(name)));
    const valueLabel = this.valueLabel;

    return new Chart(this.canvasRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors,
            borderColor: cssVar('--color-canvas-subtle'),
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
              color: cssVar('--color-fg-default')
            }
          },
          tooltip: {
            backgroundColor: cssVar('--color-canvas-inset'),
            borderColor: cssVar('--color-border-muted'),
            borderWidth: 1,
            titleColor: cssVar('--color-fg-default'),
            bodyColor: cssVar('--color-fg-muted'),
            callbacks: {
              label: ctx => `${ctx.label}: ${ctx.parsed.toLocaleString()} ${valueLabel}`
            }
          }
        }
      }
    });
  }
}
