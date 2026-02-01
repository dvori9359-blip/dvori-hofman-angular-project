import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`; 

  currentUser = signal<User | null>(this.getUserFromStorage());

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  login(credentials: any) {
    return this.http.post<{token: string, user: User}>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => this.saveSession(res.token, res.user))
    );
  }

  register(userData: any) {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      tap(res => this.saveSession(res.token, res.user))
    );
  }

  private saveSession(token: string, user: User) {
    try {
      if (token) localStorage.setItem('token', token);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUser.set(user);
      }
    } catch (e) {
      console.error('Storage full', e);
    }
  }

  logout() {
    localStorage.clear();
    this.currentUser.set(null);
  }
}