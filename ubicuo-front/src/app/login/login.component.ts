import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-neutral-50 via-secondary-50 to-primary-50 flex items-center justify-center p-4 relative overflow-hidden">
      <!-- Decorative elements -->
      <div class="absolute top-0 right-0 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-fade-in-up"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-fade-in-down" style="animation-delay: 0.2s;"></div>
      
      <div class="w-full max-w-md z-10 animate-scale-in">
        <!-- Card with glass effect -->
        <div class="glass-effect p-8 md:p-12">
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
              <span class="text-2xl">🏭</span>
            </div>
            <h1 class="text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
              SafeWork
            </h1>
            <p class="text-neutral-600 font-medium">
              Sistema de Higiene y Seguridad
            </p>
          </div>

          <!-- Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <!-- Username field -->
            <div class="space-y-2">
              <label for="username" class="form-label">
                <span class="text-neutral-700">👤 Usuario</span>
              </label>
              <input
                type="text"
                id="username"
                formControlName="username"
                placeholder="Ingrese su usuario"
                autocomplete="off"
                class="form-input"
              />
              <p *ngIf="loginForm.get('username')?.invalid && loginForm.get('username')?.touched" 
                 class="text-xs text-red-500 mt-1">
                El usuario es requerido
              </p>
            </div>

            <!-- Password field -->
            <div class="space-y-2">
              <label for="password" class="form-label">
                <span class="text-neutral-700">🔒 Contraseña</span>
              </label>
              <input
                type="password"
                id="password"
                formControlName="password"
                placeholder="Ingrese su contraseña"
                class="form-input"
              />
              <p *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" 
                 class="text-xs text-red-500 mt-1">
                La contraseña es requerida
              </p>
            </div>

            <!-- Submit button -->
            <button
              type="submit"
              [disabled]="loginForm.invalid || isLoading"
              class="w-full btn-primary mt-6"
              [class.opacity-50]="isLoading"
              [class.cursor-not-allowed]="isLoading"
            >
              <span *ngIf="!isLoading">✨ Ingresar</span>
              <span *ngIf="isLoading" class="flex items-center justify-center gap-2">
                <span class="animate-spin">⏳</span> Validando...
              </span>
            </button>
          </form>

          <!-- Demo info -->
          <div class="mt-6 p-4 bg-secondary-50 rounded-lg border-l-4 border-secondary-500">
            <p class="text-xs text-neutral-600">
              <span class="font-semibold text-secondary-600">💡 Demo:</span>
              Cualquier usuario/contraseña (ej: admin / 123)
            </p>
          </div>

          <!-- Footer -->
          <div class="mt-6 text-center">
            <p class="text-xs text-neutral-500">
              © 2024 Sistema de Higiene y Seguridad CIIU
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { username, password } = this.loginForm.value;
      
      setTimeout(() => {
        const success = this.authService.login(username, password);
        this.isLoading = false;
        
        if (success) {
          this.toastr.success('¡Bienvenido!', 'Sesión iniciada', {
            timeOut: 2000,
            progressBar: true,
          });
          this.router.navigate(['/dashboard']);
        } else {
          this.toastr.error('Credenciales inválidas', 'Error de autenticación', {
            timeOut: 3000,
          });
        }
      }, 800);
    }
  }
}