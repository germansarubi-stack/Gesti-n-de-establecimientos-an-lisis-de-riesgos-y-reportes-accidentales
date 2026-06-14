import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>Higiene y Seguridad</h1>
          <p>Inicie sesión para gestionar establecimientos</p>
        </div>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="username">Usuario</label>
            <input
              type="text"
              id="username"
              formControlName="username"
              placeholder="Ingrese su usuario"
              autocomplete="off"
            />
          </div>
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              placeholder="Ingrese su contraseña"
            />
          </div>
          <button type="submit" class="btn-login" [disabled]="loginForm.invalid">
            Ingresar
          </button>
          <div class="demo-info">
            <small>✨ Datos falsos: cualquier usuario/contraseña (ej: admin / 123)</small>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f5f0ff 0%, #e8e0ff 100%);
      padding: 1rem;
    }
    .login-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      border-radius: 2rem;
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.5);
      transition: transform 0.2s ease;
    }
    .login-card:hover {
      transform: translateY(-5px);
    }
    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .login-header h1 {
      color: #5e2a84;
      font-size: 1.9rem;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }
    .login-header p {
      color: #7c3a9e;
      font-size: 0.95rem;
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #4a2b6e;
      font-weight: 500;
      font-size: 0.9rem;
    }
    input {
      width: 100%;
      padding: 0.8rem 1rem;
      border: 1px solid #ddd0f0;
      border-radius: 1rem;
      font-size: 1rem;
      transition: all 0.2s;
      background: #fffef7;
    }
    input:focus {
      outline: none;
      border-color: #b77cf0;
      box-shadow: 0 0 0 3px rgba(183, 124, 240, 0.2);
    }
    .btn-login {
      width: 100%;
      background: linear-gradient(95deg, #7c3a9e, #b77cf0);
      color: white;
      border: none;
      padding: 0.9rem;
      border-radius: 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: 0.2s;
      margin-top: 0.5rem;
    }
    .btn-login:hover:not(:disabled) {
      transform: scale(1.02);
      background: linear-gradient(95deg, #6b2e8a, #a86be0);
    }
    .btn-login:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .demo-info {
      text-align: center;
      margin-top: 1.5rem;
      color: #b77cf0;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      const success = this.authService.login(username, password);
      if (success) {
        this.router.navigate(['/dashboard']);
      }
    }
  }
}