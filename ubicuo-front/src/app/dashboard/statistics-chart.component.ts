import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-statistics-chart',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  template: `
    <div class="w-full">
      <div class="mb-6">
        <h4 class="text-lg font-bold text-neutral-900 mb-4">📊 Índices de Incidencia y Casos Mortales</h4>
        
        <!-- Gráfico de Barras Horizontal -->
        <div *ngIf="data && data.length > 0" class="h-80 w-full bg-neutral-50 rounded-xl p-4">
          <ngx-charts-bar-horizontal
            [view]="view"
            [results]="data"
            [scheme]="colorScheme"  
            [gradient]="true"
            [xAxis]="true"
            [yAxis]="true"
            [legend]="true"
            [showXAxisLabel]="true"
            [showYAxisLabel]="true"
            xAxisLabel="Valor"
            yAxisLabel="Año"
            [tooltipDisabled]="false">
          </ngx-charts-bar-horizontal>
        </div>
        
        <div *ngIf="!data || data.length === 0" class="h-80 w-full bg-neutral-50 rounded-xl p-4 flex items-center justify-center">
          <p class="text-neutral-500">📭 No hay datos disponibles para mostrar</p>
        </div>
      </div>

      <!-- Estadísticas de Resumen -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-primary-50 rounded-lg p-4 border-l-4 border-primary-500">
          <p class="text-xs text-neutral-600 mb-1">Años Analizados</p>
          <p class="text-2xl font-bold text-primary-700">{{ yearsCount }}</p>
        </div>
        
        <div class="bg-accent-50 rounded-lg p-4 border-l-4 border-accent-500">
          <p class="text-xs text-neutral-600 mb-1">Incidencia Promedio</p>
          <p class="text-2xl font-bold text-accent-700">{{ avgIncidence | number:'1.1-1' }}</p>
        </div>
        
        <div class="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
          <p class="text-xs text-neutral-600 mb-1">Casos Mortales</p>
          <p class="text-2xl font-bold text-red-700">{{ totalDeaths }}</p>
        </div>
        
        <div class="bg-secondary-50 rounded-lg p-4 border-l-4 border-secondary-500">
          <p class="text-xs text-neutral-600 mb-1">Tendencia</p>
          <p class="text-2xl font-bold" [ngClass]="trendClass">{{ trendIndicator }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .ngx-charts {
        width: 100%;
      }
    }
  `]
})
export class StatisticsChartComponent {
  @Input() set chartData(value: any) {
    if (value && value.labels && value.datasets && value.labels.length > 0) {
      this.data = this.transformToNgxCharts(value);
    } else {
      this.data = [];
    }
  }

  view: [number, number] = [700, 350];
  colorScheme: Color = {
    name: 'miEsquemaPersonalizado',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#ffc800', '#00c3ff', '#8b18ff', '#ff6b6b', '#4ecdc4']
  };
  data: any[] = [];

  get yearsCount(): number {
    return this.data?.length ?? 0;
  }

  get avgIncidence(): number {
    if (!this.data || this.data.length === 0) return 0;
    const sum = this.data.reduce((acc, item) => {
      const value = item.series?.find((s: any) => s.name === 'Índice de Incidencia')?.value ?? 0;
      return acc + value;
    }, 0);
    return sum / this.data.length;
  }

  get totalDeaths(): number {
    if (!this.data || this.data.length === 0) return 0;
    return this.data.reduce((acc, item) => {
      const value = item.series?.find((s: any) => s.name === 'Casos Mortales')?.value ?? 0;
      return acc + value;
    }, 0);
  }

  get trendIndicator(): string {
    if (!this.data || this.data.length < 2) return '📊 N/A';
    const first = this.data[0].series?.find((s: any) => s.name === 'Índice de Incidencia')?.value ?? 0;
    const last = this.data[this.data.length - 1].series?.find((s: any) => s.name === 'Índice de Incidencia')?.value ?? 0;
    
    if (last > first) return '📈 Aumenta';
    if (last < first) return '📉 Disminuye';
    return '→ Estable';
  }

  get trendClass(): string {
    if (this.trendIndicator.includes('Aumenta')) return 'text-red-700';
    if (this.trendIndicator.includes('Disminuye')) return 'text-green-700';
    return 'text-yellow-700';
  }

  private transformToNgxCharts(chartData: any): any[] {
    try {
      if (!chartData?.labels || !chartData?.datasets || chartData.labels.length === 0) {
        return [];
      }

      return chartData.labels.map((label: string, index: number) => ({
        name: label,
        series: chartData.datasets
          .filter((dataset: any) => dataset && dataset.data)
          .map((dataset: any) => ({
            name: dataset.label || `Serie ${index}`,
            value: dataset.data[index] || 0
          }))
      }));
    } catch (error) {
      console.error('Error transforming chart data:', error);
      return [];
    }
  }
}
