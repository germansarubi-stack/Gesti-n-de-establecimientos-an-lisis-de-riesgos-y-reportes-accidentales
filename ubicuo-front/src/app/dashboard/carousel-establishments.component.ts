import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { register } from 'swiper/element/bundle';
import { Establishment } from '../models/establishment.model';

register();

@Component({
  selector: 'app-carousel-establishments',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
  template: `
    <div class="mb-8">
      <h2 class="section-header mb-6">🎠 Establecimientos Destacados</h2>
      
      <swiper-container 
        [slides-per-view]="slidesPerView"
        [space-between]="spaceBetween"
        [pagination]="true"
        [navigation]="true"
        [loop]="true"
        [autoplay]="{ delay: 5000 }">
        
        <swiper-slide *ngFor="let est of establishments">
          <div class="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 min-h-96 flex flex-col justify-between border-2 border-primary-200 hover:border-accent-500 transition-all">
            <!-- Header -->
            <div>
              <h3 class="text-2xl font-bold text-neutral-900 mb-3">{{ est.nombre }}</h3>
              <div class="flex flex-wrap gap-2 mb-4">
                <span class="badge-primary">{{ est.areaRubro }}</span>
                <span class="badge-secondary">{{ est.provincia }}</span>
              </div>
              
              <!-- Detalles -->
              <div class="space-y-2 text-sm text-neutral-700">
                <p class="flex items-center gap-2">
                  <span>📍</span> {{ est.localidad }}, {{ est.ciudad }}
                </p>
                <p class="flex items-start gap-2">
                  <span>📝</span>
                  <span class="line-clamp-2">{{ est.especificacion }}</span>
                </p>
                <div *ngIf="est.ciiuCode" class="bg-accent-50 px-3 py-2 rounded-lg border-l-4 border-accent-500 mt-2">
                  <p class="text-xs font-semibold text-accent-700">CIIU: {{ est.ciiuCode }}</p>
                  <p class="text-xs text-neutral-600">{{ est.ciiuDescription }}</p>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="pt-4 border-t border-primary-200 mt-4">
              <button class="w-full btn-primary text-sm">Ver Detalles</button>
            </div>
          </div>
        </swiper-slide>
      </swiper-container>
    </div>
  `,
  styles: [`
    :host ::ng-deep swiper-container {
      padding: 20px 0;
    }
    
    :host ::ng-deep .swiper-button-next,
    :host ::ng-deep .swiper-button-prev {
      background: rgba(139, 24, 255, 0.1);
      color: #8b18ff;
      width: 44px;
      height: 44px;
      border-radius: 50%;
    }
    
    :host ::ng-deep .swiper-button-next::after,
    :host ::ng-deep .swiper-button-prev::after {
      font-size: 20px;
    }
    
    :host ::ng-deep .swiper-pagination-bullet-active {
      background: #8b18ff;
    }
    
    :host ::ng-deep .swiper-pagination-bullet {
      background: #ffc800;
    }
  `]
})
export class CarouselEstablishmentsComponent {
  @Input() establishments: Establishment[] = [];
  
  slidesPerView = 3;
  spaceBetween = 24;

  constructor() {
    // Ajustar slides por viewport
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) {
        this.slidesPerView = 1;
      } else if (window.innerWidth < 1024) {
        this.slidesPerView = 2;
      }
    }
  }
}
