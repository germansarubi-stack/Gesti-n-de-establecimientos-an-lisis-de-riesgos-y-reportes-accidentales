import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Establishment } from '../models/establishment.model';

@Component({
  selector: 'app-dashboard-kpi',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- KPI: Total Establecimientos -->
      <div class="card bg-gradient-to-br from-primary-50 to-primary-100 border-l-4 border-primary-500 hover:shadow-lg transition-all">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-neutral-600 font-semibold">Total Establecimientos</p>
            <p class="text-4xl font-bold text-primary-700 mt-2">{{ totalEstablishments }}</p>
          </div>
          <div class="text-5xl opacity-30">🏭</div>
        </div>
        <p class="text-xs text-neutral-500 mt-3">Activos en el sistema</p>
      </div>

      <!-- KPI: Clasificados -->
      <div class="card bg-gradient-to-br from-accent-50 to-accent-100 border-l-4 border-accent-500 hover:shadow-lg transition-all">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-neutral-600 font-semibold">Clasificados CIIU</p>
            <p class="text-4xl font-bold text-accent-700 mt-2">{{ classifiedCount }}</p>
            <p class="text-xs text-accent-600 mt-1">{{ classificationPercentage }}%</p>
          </div>
          <div class="text-5xl opacity-30">🤖</div>
        </div>
        <div class="bg-accent-200 h-1 rounded-full mt-3"></div>
      </div>

      <!-- KPI: Alertas Activas -->
      <div class="card bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500 hover:shadow-lg transition-all">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-neutral-600 font-semibold">Alertas Activas</p>
            <p class="text-4xl font-bold text-red-700 mt-2">{{ activeAlerts }}</p>
          </div>
          <div class="text-5xl opacity-30">⚠️</div>
        </div>
        <p class="text-xs text-neutral-500 mt-3">Requieren atención</p>
      </div>

      <!-- KPI: Índice Promedio -->
      <div class="card bg-gradient-to-br from-secondary-50 to-secondary-100 border-l-4 border-secondary-500 hover:shadow-lg transition-all">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-neutral-600 font-semibold">Riesgo Promedio</p>
            <p class="text-4xl font-bold text-secondary-700 mt-2">{{ riskScore }}</p>
            <p class="text-xs text-secondary-600 mt-1" [ngClass]="getRiskClass()">{{ riskLevel }}</p>
          </div>
          <div class="text-5xl opacity-30">📊</div>
        </div>
        <div class="bg-gradient-to-r from-secondary-400 to-secondary-600 h-1 rounded-full mt-3"></div>
      </div>
    </div>

    <!-- Gráfico de Progreso -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Categorías -->
      <div class="card">
        <h3 class="text-lg font-bold text-neutral-900 mb-6">📂 Rubros Principales</h3>
        <div class="space-y-4">
          <div *ngFor="let category of topCategories" class="flex items-center gap-4">
            <div class="flex-1">
              <div class="flex justify-between mb-1">
                <span class="text-sm font-semibold text-neutral-700">{{ category.name }}</span>
                <span class="text-sm text-neutral-600">{{ category.count }}</span>
              </div>
              <div class="bg-neutral-200 rounded-full h-2">
                <div 
                  class="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full"
                  [style.width.%]="category.percentage">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado de Clasificación -->
      <div class="card">
        <h3 class="text-lg font-bold text-neutral-900 mb-6">🎯 Estado de Clasificación</h3>
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-accent-100 flex items-center justify-center text-xl">🤖</div>
            <div class="flex-1">
              <p class="text-sm text-neutral-600">Clasificados</p>
              <p class="text-2xl font-bold text-accent-700">{{ classifiedCount }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-neutral-500">{{ classificationPercentage }}%</p>
            </div>
          </div>
          
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center text-xl">⏳</div>
            <div class="flex-1">
              <p class="text-sm text-neutral-600">Pendientes</p>
              <p class="text-2xl font-bold text-yellow-700">{{ pendingCount }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-neutral-500">{{ pendingPercentage }}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardKPIComponent {
  @Input() establishments: Establishment[] = [];

  get totalEstablishments(): number {
    return this.establishments.length;
  }

  get classifiedCount(): number {
    return this.establishments.filter(e => e.ciiuCode).length;
  }

  get classificationPercentage(): number {
    if (this.totalEstablishments === 0) return 0;
    return Math.round((this.classifiedCount / this.totalEstablishments) * 100);
  }

  get pendingCount(): number {
    return this.totalEstablishments - this.classifiedCount;
  }

  get pendingPercentage(): number {
    if (this.totalEstablishments === 0) return 0;
    return 100 - this.classificationPercentage;
  }

  get activeAlerts(): number {
    return Math.max(0, Math.floor(Math.random() * 5)); // Demo: 0-4 alertas
  }

  get riskScore(): number {
    return parseFloat((Math.random() * 40 + 20).toFixed(1)); // Demo: 20-60
  }

  get riskLevel(): string {
    const score = this.riskScore;
    if (score < 30) return '✅ Bajo';
    if (score < 45) return '⚠️ Moderado';
    return '🔴 Alto';
  }

  getRiskClass(): string {
    const score = this.riskScore;
    if (score < 30) return 'text-green-600';
    if (score < 45) return 'text-yellow-600';
    return 'text-red-600';
  }

  get topCategories(): any[] {
    const categories: { [key: string]: number } = {};
    
    this.establishments.forEach(e => {
      const key = e.areaRubro || 'Sin clasificar';
      categories[key] = (categories[key] || 0) + 1;
    });

    return Object.entries(categories)
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / this.totalEstablishments) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
}
