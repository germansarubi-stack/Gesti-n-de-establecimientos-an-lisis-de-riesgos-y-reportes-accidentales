// services/establishment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Establishment } from '../models/establishment.model';
import { AuthService } from './auth.service';


@Injectable({ providedIn: 'root' })
export class EstablishmentService {
  private establishmentsMap: Map<string, Establishment[]> = new Map();

  // Inyectamos HttpClient para hablar con Java
  constructor(private authService: AuthService, private http: HttpClient) {
    this.loadFromLocalStorage();
  }


  private loadFromLocalStorage(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('establishments_')) {
        const userId = key.replace('establishments_', '');
        const data = localStorage.getItem(key);
        if (data) {
          this.establishmentsMap.set(userId, JSON.parse(data));
        }
      }
    });
  }

  private saveToLocalStorage(userId: string): void {
    const establishments = this.establishmentsMap.get(userId) || [];
    localStorage.setItem(`establishments_${userId}`, JSON.stringify(establishments));
  }

  getEstablishments(): Establishment[] {
    const user = this.authService.getCurrentUser();
    if (!user) return [];
    return this.establishmentsMap.get(user.id) || [];
  }

  addEstablishment(establishment: Omit<Establishment, 'id'>): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    const current = this.getEstablishments();
    const newId = Date.now();
    const newEstablishment: Establishment = {
      ...establishment,
      id: newId
    };
    const updated = [...current, newEstablishment];
    this.establishmentsMap.set(user.id, updated);
    this.saveToLocalStorage(user.id);
  }

  // Método opcional para eliminar (no requerido pero útil)
  deleteEstablishment(id: number): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;
    const current = this.getEstablishments();
    const updated = current.filter(e => e.id !== id);
    this.establishmentsMap.set(user.id, updated);
    this.saveToLocalStorage(user.id);
  }

  // Método para actualizar un establecimiento existente (así guardamos el CIIU)
  updateEstablishment(est: Establishment): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;
    const current = this.getEstablishments();
    const index = current.findIndex(e => e.id === est.id);
    if (index !== -1) {
      current[index] = est;
      this.establishmentsMap.set(user.id, current);
      this.saveToLocalStorage(user.id);
    }
  }

  // La llamada a tu API corporativa (Actualizada para el Data Warehouse)
  sugerirCIIU(descripcion: string, provincia: string = 'Nacional'): Observable<any> {
    const params = new HttpParams()
      .set('descripcion', descripcion)
      .set('provincia', provincia);

    return this.http.get('http://localhost:8080/api/ciiu/sugerir', { params });
  }

  // Llamada al endpoint de estadísticas
  obtenerEstadisticasCIIU(ciiu: string): Observable<any> {
    return this.http.get(`http://localhost:8080/api/ciiu/estadisticas/${ciiu}`);
  }
}