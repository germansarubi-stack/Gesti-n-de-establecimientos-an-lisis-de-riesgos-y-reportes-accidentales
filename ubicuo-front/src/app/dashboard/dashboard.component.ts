import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EstablishmentService } from '../services/establishment.service';
import { AuthService } from '../services/auth.service';
import { Establishment } from '../models/establishment.model';
import { BaseChartDirective } from 'ng2-charts';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BaseChartDirective],
  template: `
    <div class="dashboard-container">
      <!-- Barra superior -->
      <header class="dashboard-header">
        <div class="logo-area">
          <h2>🏭 SafeWork</h2>
          <span class="badge">Higiene & Seguridad</span>
        </div>
        <div class="user-info">
          <span class="user-greeting">👋 Hola, {{ currentUsername }}</span>
          <button class="btn-logout" (click)="logout()">Salir</button>
        </div>
      </header>

      <div class="dashboard-content">
        <!-- Formulario para agregar establecimiento -->
        <div class="form-card">
          <h3>➕ Cargar nuevo establecimiento</h3>
          <form [formGroup]="establishmentForm" (ngSubmit)="addEstablishment()">
            <div class="form-grid">
              <div class="form-field">
                <label>Nombre del establecimiento *</label>
                <input type="text" formControlName="nombre" placeholder="Ej: Vidrios del Sur" />
              </div>
              <div class="form-field">
                <label>Área / Rubro *</label>
                <input type="text" formControlName="areaRubro" placeholder="Ej: Manufactura" />
              </div>

              <div class="form-field">
                <label>Provincia *</label>
                  <select formControlName="provincia" class="form-control" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc;">
                    <option *ngFor="let prov of listaProvincias" [value]="prov">
                      {{ prov === 'Nacional' ? 'Todo el País (Nacional)' : prov }}
                    </option>
                  </select>
              </div>

              <div class="form-field">
                <label>Localidad *</label>
                <input type="text" formControlName="localidad" placeholder="Ej: Avellaneda" />
              </div>
              <div class="form-field">
                <label>Ciudad *</label>
                <input type="text" formControlName="ciudad" placeholder="Ej: Buenos Aires" />
              </div>
              <div class="form-field">
                <label>Dirección *</label>
                <input type="text" formControlName="direccion" placeholder="Calle y número" />
              </div>
              <div class="form-field full-width">
                <label>Especificación *</label>
                <textarea formControlName="especificacion" rows="2" placeholder="Describe a qué se dedica, ej: 'Fábrica de vidrio templado y laminado'"></textarea>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn-primary" [disabled]="establishmentForm.invalid">
                Guardar establecimiento
              </button>
            </div>
          </form>
        </div>

        <!-- Lista de establecimientos -->
        <div class="establishments-section">
          <h3>📋 Mis establecimientos</h3>
          <div *ngIf="establishments.length === 0" class="empty-state">
            <p>No hay establecimientos cargados. ¡Completa el formulario para agregar uno!</p>
          </div>
          <div class="cards-grid">
            <div *ngFor="let est of establishments" class="est-card">
              <div class="card-header">
                <h4>{{ est.nombre }}</h4>
                <span class="rubro-tag">{{ est.areaRubro }}</span>
              </div>
              <div class="card-body">
                <p><span class="detail-icon">📍</span> {{ est.direccion }}, {{ est.localidad }}, {{ est.ciudad }}</p>
                <p><span class="detail-icon">🏭</span> {{ est.especificacion }}</p>
              </div>

              <div class="card-actions-row">
                <button class="btn-checklist" (click)="onChecklist(est.nombre)">✅ Checklist</button>
                <button class="btn-avisos" (click)="onAvisos(est.nombre)">📢 Avisos</button>
                <button class="btn-reportes" (click)="onReportes(est.nombre)">📊 Reportes</button>
              </div>
              
              <div class="card-actions-row ai-row">
                
                <div class="ciiu-wrapper">
                  <div class="ciiu-tooltip" *ngIf="est.showCiiu && est.ciiuCode">
                    <strong>{{ est.ciiuCode }}</strong>
                    <div class="tooltip-desc">{{ est.ciiuDescription }}</div>
                  </div>
                  <button class="btn-ciiu" (click)="onCIIU(est)" [disabled]="est.loadingCiiu">
                    {{ est.loadingCiiu ? '🧠 Pensando...' : (est.ciiuCode ? 'CIIU: ' + est.ciiuCode : '🤖 Sugerir CIIU') }}
                  </button>
                </div>

                <button *ngIf="est.ciiuCode" class="btn-stats" (click)="onVerEstadisticas(est)">
                  {{ est.statsLoading ? '⏳ Cargando...' : '📊 Estadísticas' }}
                </button>

              </div>

              <div class="stats-panel" *ngIf="est.showStats && !est.statsLoading && est.chartData">
                <div class="ai-analysis">
                  <strong>🤖 Resumen Ejecutivo (IA):</strong>
                  <p>{{ est.analisisIA }}</p>
                </div>
                <div class="chart-wrapper">
                  <canvas baseChart
                    [data]="est.chartData"
                    [options]="{ responsive: true, maintainAspectRatio: false }"
                    type="bar">
                  </canvas>
                </div>
              </div>
              <button class="btn-delete" (click)="deleteEstablishment(est.id)" title="Eliminar">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: #faf7ff;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    }
    .dashboard-header {
      background: linear-gradient(120deg, #ffffff, #fff6e8);
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border-bottom: 2px solid #e9d5ff;
      flex-wrap: wrap;
    }
    .logo-area {
      display: flex;
      align-items: baseline;
      gap: 1rem;
    }
    .logo-area h2 {
      color: #6c2e9e;
      margin: 0;
      font-weight: 700;
    }
    .badge {
      background: #f3e8ff;
      color: #8b5cf6;
      padding: 0.2rem 0.8rem;
      border-radius: 30px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .user-greeting {
      font-weight: 500;
      color: #4c1d95;
      background: #fef9e3;
      padding: 0.4rem 1rem;
      border-radius: 40px;
    }
    .btn-logout {
      background: #fde68a;
      border: none;
      padding: 0.5rem 1.2rem;
      border-radius: 2rem;
      font-weight: 600;
      color: #7c3a9e;
      cursor: pointer;
      transition: 0.2s;
    }
    .btn-logout:hover {
      background: #fcd34d;
      transform: scale(0.97);
    }
    .dashboard-content {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    .form-card {
      background: white;
      border-radius: 1.8rem;
      padding: 1.8rem;
      margin-bottom: 3rem;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.03);
      border: 1px solid #ffe6b3;
    }
    .form-card h3 {
      color: #6c2e9e;
      margin-top: 0;
      margin-bottom: 1.5rem;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.2rem;
    }
    .full-width {
      grid-column: 1 / -1;
    }
    .form-field label {
      display: block;
      font-weight: 500;
      margin-bottom: 0.4rem;
      color: #5b21b6;
      font-size: 0.85rem;
    }
    .form-field input, .form-field textarea {
      width: 100%;
      padding: 0.7rem 1rem;
      border: 1.5px solid #e9d5ff;
      border-radius: 1rem;
      font-family: inherit;
      transition: 0.2s;
      background: #fffefa;
    }
    .form-field input:focus, .form-field textarea:focus {
      outline: none;
      border-color: #b77cf0;
      box-shadow: 0 0 0 3px rgba(183, 124, 240, 0.15);
    }
    .form-actions {
      margin-top: 1.8rem;
      display: flex;
      justify-content: flex-end;
    }
    .btn-primary {
      background: linear-gradient(95deg, #8b5cf6, #c084fc);
      border: none;
      padding: 0.7rem 2rem;
      border-radius: 2rem;
      color: white;
      font-weight: bold;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 12px rgba(139, 92, 246, 0.3);
    }
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: default;
    }
    .establishments-section h3 {
      color: #4c1d95;
      margin-bottom: 1.5rem;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.8rem;
    }
    .est-card {
      background: #ffffff;
      border-radius: 1.5rem;
      padding: 1.2rem 1.2rem 1rem;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
      transition: all 0.2s ease;
      border: 1px solid #fff1ce;
      position: relative;
      display: flex;
      flex-direction: column;
      backdrop-filter: blur(2px);
    }
    .est-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 30px -12px rgba(108, 46, 158, 0.15);
      border-color: #dcfce7;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      flex-wrap: wrap;
      margin-bottom: 0.8rem;
      border-bottom: 1px dashed #f3e8ff;
      padding-bottom: 0.6rem;
    }
    .card-header h4 {
      margin: 0;
      font-size: 1.3rem;
      color: #3b0764;
    }
    .rubro-tag {
      background: #fef3c7;
      color: #b45309;
      font-size: 0.7rem;
      padding: 0.2rem 0.7rem;
      border-radius: 30px;
      font-weight: 600;
    }
    .card-body {
      flex: 1;
      margin: 0.6rem 0 1rem;
      font-size: 0.9rem;
    }
    .card-body p {
      margin: 0.4rem 0;
      color: #2d2a3e;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .detail-icon {
      font-size: 1.1rem;
    }
    /* --- Organización de los botones en filas --- */
    .card-actions-row {
      display: flex;
      gap: 0.7rem;
      flex-wrap: wrap;
      margin-top: 0.8rem;
    }
    .ai-row {
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px dashed #f3e8ff;
    }
    /* Botones de la primera fila */
    .btn-checklist, .btn-avisos, .btn-reportes {
      border: none;
      padding: 0.4rem 0.9rem;
      border-radius: 2rem;
      font-weight: 600;
      font-size: 0.75rem;
      cursor: pointer;
      transition: 0.1s linear;
      background: white;
    }
    .btn-checklist { background: #dbeafe; color: #1e3a8a; border: 1px solid #bfdbfe; }
    .btn-avisos { background: #fef9c3; color: #854d0e; border: 1px solid #fde047; }
    .btn-reportes { background: #ede9fe; color: #5b21b6; border: 1px solid #c4b5fd; }
    
    .btn-checklist:hover, .btn-avisos:hover, .btn-reportes:hover {
      transform: scale(0.96);
      filter: brightness(0.97);
    }
    /* --- Botones de la segunda fila (IA) --- */
    .ciiu-wrapper {
      position: relative;
      display: inline-block;
    }
    .btn-ciiu {
      background: #f3e8ff;
      border: 1px solid #e9d5ff;
      font-size: 0.75rem;
      font-weight: bold;
      padding: 0.4rem 0.9rem;
      border-radius: 2rem;
      color: #6b21a5;
      cursor: pointer;
      transition: 0.2s;
    }
    .btn-ciiu:hover:not(:disabled) {
      background: #e9d5ff;
      transform: scale(0.95);
    }
    .btn-ciiu:disabled {
      opacity: 0.7;
      cursor: wait;
    }
    
    .btn-stats {
      background: #3b0764;
      color: white;
      border: none;
      padding: 0.4rem 0.9rem;
      border-radius: 2rem;
      font-weight: 600;
      font-size: 0.75rem;
      cursor: pointer;
      transition: 0.1s linear;
      box-shadow: 0 2px 4px rgba(59, 7, 100, 0.2);
    }
    .btn-stats:hover {
      transform: scale(0.96);
      background: #4c1d95;
    }
    /* Tooltip del CIIU (Ahora flota hacia arriba sin romper la tarjeta) */
    .ciiu-tooltip {
      position: absolute;
      bottom: 115%;
      left: 0;
      background: #3b0764;
      color: white;
      padding: 0.7rem;
      border-radius: 0.8rem;
      width: max-content;
      max-width: 220px;
      box-shadow: 0 4px 15px rgba(59, 7, 100, 0.3);
      z-index: 10;
      animation: fadeIn 0.2s ease-out;
    }
    .tooltip-desc {
      font-size: 0.65rem;
      color: #e9d5ff;
      margin-top: 4px;
      line-height: 1.3;
    }
    /* --- Panel Desplegable de Estadísticas --- */
    .stats-panel {
      margin-top: 1rem;
      padding: 1rem;
      background: #ffffff;
      border: 1px solid #e9d5ff;
      border-radius: 12px;
      animation: fadeIn 0.3s ease-out;
      width: 100%;
    }
    .ai-analysis {
      background: #fdfa871a; /* Tono muy suave para destacar el texto */
      padding: 10px;
      border-radius: 8px;
      font-size: 0.85rem;
      color: #2d2a3e;
      line-height: 1.5;
      margin-bottom: 15px;
      border-left: 4px solid #b77cf0;
    }
    .ai-analysis p {
      margin: 5px 0 0 0;
    }
    .chart-wrapper {
      position: relative;
      height: 220px; /* Altura ideal para la tarjeta */
      width: 100%;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .btn-ciiu:hover {
      background: #e9d5ff;
      transform: scale(0.95);
    }
    .btn-delete {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(255,255,240,0.9);
      border: none;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      font-size: 0.9rem;
      cursor: pointer;
      opacity: 0.7;
      transition: 0.1s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-delete:hover {
      opacity: 1;
      background: #fee2e2;
      transform: scale(1.05);
    }
    .empty-state {
      background: #fff6e8;
      border-radius: 2rem;
      padding: 2rem;
      text-align: center;
      color: #7c3a9e;
    }
    @media (max-width: 640px) {
      .dashboard-content {
        padding: 1rem;
      }
      .cards-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  establishmentForm: FormGroup;
  establishments: Establishment[] = [];
  currentUsername = '';

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
    private cdr: ChangeDetectorRef
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
      this.establishmentForm.reset();
    }
  }

  deleteEstablishment(id: number): void {
    this.estService.deleteEstablishment(id);
    this.loadEstablishments();
  }

  onChecklist(nombre: string): void {
    alert(`📋 Abriendo checklist para: ${nombre}\n(Integración futura de evaluación de riesgos)`);
  }

  onAvisos(nombre: string): void {
    alert(`📢 Avisos de seguridad para: ${nombre}\n(Próximamente: notificaciones y alertas)`);
  }

  onReportes(nombre: string): void {
    alert(`📊 Reportes ambientales y de higiene - ${nombre}\n(Sistema de indicadores)`);
  }

  // --- BOTÓN 1: Solo clasifica ---
  onCIIU(est: Establishment): void {
    if (est.ciiuCode) {
      est.showCiiu = !est.showCiiu;
      return;
    }

    est.loadingCiiu = true;
    est.showCiiu = false;

    const contextoParaIA = `${est.areaRubro}. ${est.especificacion}`;

    // Solo pide el CIIU
    this.estService.sugerirCIIU(contextoParaIA).subscribe({
      next: (respuesta) => {
        est.ciiuCode = respuesta.codigo_ciiu; 
        est.ciiuDescription = respuesta.rubro; 
        
        est.loadingCiiu = false;
        est.showCiiu = true;   
        
        this.estService.updateEstablishment(est); 
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error al obtener CIIU:", err);
        alert('No se pudo clasificar el establecimiento.');
        est.loadingCiiu = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- BOTÓN 2: Solo Data Warehouse ---
  onVerEstadisticas(est: Establishment): void {
    // Si ya lo consultó antes, abre y cierra al instante
    if (est.chartData && est.analisisIA) {
      est.showStats = !est.showStats;
      return;
    }

    // Validación UX: No podés pedir estadísticas si no sabés el rubro
    if (!est.ciiuCode) {
      alert('Por favor, obtené el código CIIU primero haciendo clic en "Ver CIIU".');
      return;
    }

    est.statsLoading = true;
    est.showStats = false;
    
    const provinciaParaBD = est.provincia || 'Nacional';

    // Pide la estadística pasando los datos que ya obtuvimos en el Paso 1
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
              { data: incidencias, label: 'Índice de Incidencia', backgroundColor: '#b77cf0', borderRadius: 4 },
              { data: mortales, label: 'Casos Mortales', backgroundColor: '#ff4d4d', borderRadius: 4 }
            ]
          };
        }

        est.statsLoading = false;
        est.showStats = true; 

        this.estService.updateEstablishment(est);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error al obtener estadísticas:", err);
        alert('No hay datos históricos suficientes para este rubro.');
        est.statsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}