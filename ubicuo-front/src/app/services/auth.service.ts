// services/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/establishment.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser: User | null = null;
  private readonly USER_KEY = 'currentUser';

  constructor(private router: Router) {
    const stored = localStorage.getItem(this.USER_KEY);
    if (stored) {
      this.currentUser = JSON.parse(stored);
    }
  }

  login(username: string, password: string): boolean {
    // Datos falsos: cualquier usuario y contraseña no vacíos es válido
    if (username.trim() && password.trim()) {
      const user: User = {
        id: username.toLowerCase().replace(/\s/g, '_') + '_' + Date.now(),
        username: username.trim()
      };
      this.currentUser = user;
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/']);
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }
}