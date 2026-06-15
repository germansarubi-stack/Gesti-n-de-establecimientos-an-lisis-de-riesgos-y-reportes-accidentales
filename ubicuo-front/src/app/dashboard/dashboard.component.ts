import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EstablishmentService } from '../services/establishment.service';
import { AuthService } from '../services/auth.service';
import { Establishment } from '../models/establishment.model';
import { BaseChartDirective } from 'ng2-charts';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BaseChartDirective],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-neutral-50 via-secondary-50 to-neutral-50">
      <!-- Header -->
      <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-200 shadow-sm">
        <div class="container-safe h-16 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-2xl">
              🏭
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gradient-primary">SafeWork</h1>
              <p class="text-xs text-neutral-500">Higiene y Seguridad CIIU</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <span class="px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-semibold">
              👋 {{ currentUsername }}
            </span>
            <button (click)="logout()" class="btn-secondary px-6 py-2 text-sm">
              Salir
            </button>
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="container-safe py-8">
        <!-- Section: Agregar Establecimiento -->
        <section class="mb-12">
          <h2 class="section-header mb-6">➕ Cargar Nuevo Establecimiento</h2>
          <div class="card">
            <form [formGroup]="establishmentForm" (ngSubmit)="addEstablishment()" class="space-y-6">
              <!-- Grid de campos -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <!-- Nombre -->
                <div class="space-y-2">
                  <label class="form-label">🏢 Nombre del establecimiento</label>
                  <input type="text" formControlName="nombre" placeholder="Ej: Vidrios del Sur" class="form-input" />
                </div>

                <!-- Área/Rubro -->
                <div class="space-y-2">
                  <label class="form-label">⚙️ Área / Rubro</label>
                  <input type="text" formControlName="areaRubro" placeholder="Ej: Manufactura" class="form-input" />
                </div>

                <!-- Provincia -->
                <div class="space-y-2">
                  <label class="form-label">📍 Provincia</label>
                  <select formControlName="provincia" class="form-input">
                    <option *ngFor="let prov of listaProvincias" [value]="prov">
                      {{ prov === 'Nacional' ? 'Todo el País (Nacional)' : prov }}
                    </option>
                  </select>
                </div>

                <!-- Localidad -->
                <div class="space-y-2">
                  <label class="form-label">🏘️ Localidad</label>
                  <input type="text" formControlName="localidad" placeholder="Ej: Avellaneda" class="form-input" />
                </div>

                <!-- Ciudad -->
                <div class="space-y-2">
                  <label class="form-label">🌆 Ciudad</label>
                  <input type="text" formControlName="ciudad" placeholder="Ej: Buenos Aires" class="form-input" />
                </div>

                <!-- Dirección -->
                <div class="space-y-2">
                  <label class="form-label">📮 Dirección</label>
                  <input type="text" formControlName="direccion" placeholder="Calle y número" class="form-input" />
                </div>
              </div>

              <!-- Especificación -->
              <div class="space-y-2">
                <label class="form-label">📝 Especificación</label>
                <textarea formControlName="especificacion" rows="3" placeholder="Describe a qué se dedica..." class="form-input resize-none"></textarea>
              </div>

              <!-- Submit button -->
              <div class="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                <button type="button" (click)="resetForm()" class="btn-outline px-6">
                  Limpiar
                </button>
                <button type="submit" [disabled]="establishmentForm.invalid" class="btn-primary px-6">
                  💾 Guardar Establecimiento
                </button>
              </div>
            </form>
          </div>
        </section>

        <!-- Section: Mis Establecimientos -->
        <section>
          <h2 class="section-header mb-6">📋 Mis Establecimientos</h2>
          
          <!-- Empty state -->
          <div *ngIf="establishments.length === 0" class="card text-center py-12">
            <p class="text-3xl mb-3">📭</p>
            <p class="text-lg text-neutral-600">No hay establecimientos cargados</p>
            <p class="text-sm text-neutral-500 mt-2">Completa el formulario anterior para agregar uno</p>
          </div>

          <!-- Cards Grid -->
          <div *ngIf="establishments.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let est of establishments" class="card-hover group relative">
              <!-- Delete button -->
              <button (click)="deleteEstablishment(est.id)" class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 bg-red-100 hover:bg-red-200 text-red-700 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-300">
                🗑️
              </button>

              <!-- Header -->
              <div class="mb-4 pb-4 border-b-2 border-primary-100">
                <h3 class="text-xl font-bold text-neutral-900 mb-2">{{ est.nombre }}</h3>
                <div class="flex flex-wrap gap-2">
                  <span class="badge-primary">{{ est.areaRubro }}</span>
                  <span class="badge-secondary">{{ est.provincia }}</span>
                </div>
              </div>

              <!-- Details -->
              <div class="space-y-2 mb-6 text-sm text-neutral-600">
                <p class="flex items-center gap-2">
                  <span>📍</span> {{ est.direccion }}, {{ est.localidad }}, {{ est.ciudad }}
                </p>
                <p class="flex items-start gap-2">
                  <span class="mt-0.5">🏭</span> 
                  <span class="line-clamp-3">{{ est.especificacion }}</span>
                </p>
              </div>

              <!-- Action Buttons Row 1 -->
              <div class="flex gap-2 mb-3 flex-wrap">
                <button (click)="onChecklist(est.nombre)" class="px-3 py-2 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition">
                  ✅ Checklist
                </button>
                <button (click)="onAvisos(est.nombre)" class="px-3 py-2 rounded-lg text-xs font-semibold bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition">
                  📢 Avisos
                </button>
                <button (click)="onReportes(est.nombre)" class="px-3 py-2 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 transition">
                  📊 Reportes
                </button>
              </div>

              <!-- Action Buttons Row 2 (IA) -->
              <div class="flex gap-2 pt-3 border-t border-neutral-100 flex-wrap">
                <button (click)="onCIIU(est)" [disabled]="est.loadingCiiu" class="px-3 py-2 rounded-lg text-xs font-semibold"
                  [ngClass]="est.ciiuCode ? 'bg-accent-100 text-accent-700 hover:bg-accent-200' : 'bg-accent-50 text-accent-600 hover:bg-accent-100'"
                  [disabled]="est.loadingCiiu">
                  {{ est.loadingCiiu ? '🧠 Pensando...' : (est.ciiuCode ? '✓ CIIU: ' + est.ciiuCode : '🤖 Sugerir CIIU') }}
                </button>

                <button *ngIf="est.ciiuCode" (click)="onVerEstadisticas(est)" [disabled]="est.statsLoading" class="px-3 py-2 rounded-lg text-xs font-semibold bg-gradient-primary text-white hover:shadow-lg transition">
                  {{ est.statsLoading ? '⏳ Cargando...' : '📊 Estadísticas' }}
                </button>
              </div>

              <!-- CIIU Tooltip -->
              <div *ngIf="est.showCiiu && est.ciiuCode" class="mt-3 p-3 bg-accent-50 border-l-4 border-accent-500 rounded text-xs">
                <strong class="text-accent-700">{{ est.ciiuCode }}</strong>
                <p class="text-neutral-600 mt-1">{{ est.ciiuDescription }}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- Modal de Estadísticas -->
      <div *ngIf="selectedEstablishment && showStatsModal" class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
        <div class="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
          <!-- Header -->
          <div class="bg-gradient-to-r from-primary-500 to-accent-500 px-8 py-6 flex items-center justify-between">
            <div>
              <h3 class="text-2xl font-bold text-white">📊 Estadísticas Profesionales</h3>
              <p class="text-primary-100 text-sm mt-1">{{ selectedEstablishment.nombre }}</p>
            </div>
            <button (click)="closeStatsModal()" class="text-white hover:bg-white/20 rounded-lg p-2 transition">
              ✕
            </button>
          </div>

          <!-- Content -->
          <div class="p-8 max-h-[80vh] overflow-y-auto">
            <!-- IA Analysis -->
            <div class="mb-8">
              <div class="bg-gradient-to-r from-primary-50 to-accent-50 border-2 border-primary-200 rounded-xl p-6">
                <h4 class="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
                  <span class="text-2xl">🤖</span> Análisis Inteligente (IA)
                </h4>
                <p class="text-neutral-700 leading-relaxed">{{ selectedEstablishment.analisisIA }}</p>
              </div>
            </div>

            <!-- Chart -->
            <div *ngIf="selectedEstablishment.chartData" class="mb-8">
              <h4 class="text-lg font-bold text-neutral-900 mb-4">📈 Índices de Incidencia y Casos Mortales</h4>
              <div class="h-80 bg-neutral-50 rounded-xl p-6">
                <canvas baseChart
                  [data]="selectedEstablishment.chartData"
                  [options]="{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }"
                  type="bar">
                </canvas>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex gap-4 justify-end pt-6 border-t border-neutral-200">
              <button (click)="closeStatsModal()" class="btn-outline px-6">
                Cerrar
              </button>
              <button (click)="downloadReport()" class="btn-primary px-6">
                ⬇️ Descargar Reporte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  establishmentForm: FormGroup;
  establishments: Establishment[] = [];
  currentUsername = '';
  selectedEstablishment: Establishment | null = null;
  showStatsModal = false;

  listaProvincias: string[] = [
    'Nacional', 'C.A.B.A.', 'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
    'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones',
    'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe',
    'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
  ];

  constructor(
    private fb: FormBuilder,
    private estService: EstablishmentService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.establishmentForm = this.fb.group({
      nombre: ['', Validators.required],
      areaRubro: ['', Validators.required],
      localidad: ['', Validators.required],
      ciudad: ['', Validators.required],
      direccion: ['', Validators.required],
      especificacion: ['', Validators.required],
      provincia: ['Nacional', Validators.required]
    });
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUsername = user ? user.username : 'Usuario';
    this.loadEstablishments();
  }

  loadEstablishments(): void {
    this.establishments = this.estService.getEstablishments();
  }

  addEstablishment(): void {
    if (this.establishmentForm.valid) {
      this.estService.addEstablishment(this.establishmentForm.value);
      this.loadEstablishments();
      this.toastr.success('✅ Establecimiento guardado', 'Éxito', { timeOut: 2000 });
      this.establishmentForm.reset();
      this.cdr.detectChanges();
    }
  }

  resetForm(): void {
    this.establishmentForm.reset();
  }

  deleteEstablishment(id: number): void {
    Swal.fire({
      title: '¿Eliminar establecimiento?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8b18ff',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.estService.deleteEstablishment(id);
        this.loadEstablishments();
        this.toastr.info('🗑️ Establecimiento eliminado', '', { timeOut: 1500 });
      }
    });
  }

  onChecklist(nombre: string): void {
    this.toastr.info(`📋 Checklist para: ${nombre}`, '', { timeOut: 2000 });
  }

  onAvisos(nombre: string): void {
    this.toastr.info(`📢 Avisos de seguridad: ${nombre}`, '', { timeOut: 2000 });
  }

  onReportes(nombre: string): void {
    this.toastr.info(`📊 Reportes: ${nombre}`, '', { timeOut: 2000 });
  }

  onCIIU(est: Establishment): void {
    if (est.ciiuCode) {
      est.showCiiu = !est.showCiiu;
      return;
    }

    est.loadingCiiu = true;
    const contextoParaIA = `${est.areaRubro}. ${est.especificacion}`;

    this.estService.sugerirCIIU(contextoParaIA).subscribe({
      next: (respuesta) => {
        est.ciiuCode = respuesta.codigo_ciiu;
        est.ciiuDescription = respuesta.rubro;
        est.loadingCiiu = false;
        est.showCiiu = true;
        this.estService.updateEstablishment(est);
        this.toastr.success('✅ CIIU clasificado', '', { timeOut: 1500 });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener CIIU:', err);
        this.toastr.error('❌ Error al clasificar', '', { timeOut: 2000 });
        est.loadingCiiu = false;
        this.cdr.detectChanges();
      }
    });
  }

  onVerEstadisticas(est: Establishment): void {
    if (est.chartData && est.analisisIA) {
      this.selectedEstablishment = est;
      this.showStatsModal = true;
      return;
    }

    if (!est.ciiuCode) {
      this.toastr.warning('⚠️ Obtén el código CIIU primero', '', { timeOut: 2000 });
      return;
    }

    est.statsLoading = true;
    const provinciaParaBD = est.provincia || 'Nacional';

    this.estService.obtenerEstadisticasCIIU(est.ciiuCode, est.ciiuDescription!, provinciaParaBD).subscribe({
      next: (respuesta) => {
        est.analisisIA = respuesta.analisis_inteligente;

        if (respuesta.estadisticas_crudas && respuesta.estadisticas_crudas.length > 0) {
          const anios = respuesta.estadisticas_crudas.map((d: any) => d.anio);
          const incidencias = respuesta.estadisticas_crudas.map((d: any) => d.indice_incidencia);
          const mortales = respuesta.estadisticas_crudas.map((d: any) => d.casos_mortales);

          est.chartData = {
            labels: anios,
            datasets: [
              {
                data: incidencias,
                label: 'Índice de Incidencia',
                backgroundColor: '#ffc800',
                borderColor: '#ccaf00',
                borderWidth: 2
              },
              {
                data: mortales,
                label: 'Casos Mortales',
                backgroundColor: '#8b18ff',
                borderColor: '#6d0be6',
                borderWidth: 2
              }
            ]
          };
        }

        est.statsLoading = false;
        this.selectedEstablishment = est;
        this.showStatsModal = true;
        this.estService.updateEstablishment(est);
        this.toastr.success('✅ Estadísticas cargadas', '', { timeOut: 1500 });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener estadísticas:', err);
        this.toastr.error('❌ No hay datos suficientes', '', { timeOut: 2000 });
        est.statsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeStatsModal(): void {
    this.showStatsModal = false;
    this.selectedEstablishment = null;
  }

  downloadReport(): void {
    this.toastr.info('📥 Descargando reporte...', '', { timeOut: 2000 });
  }

  logout(): void {
    Swal.fire({
      title: '¿Cerrar sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8b18ff',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }
}
