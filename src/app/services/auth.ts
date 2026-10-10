import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

const apiUrl= environment.apiUrl

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  // Getters rápidos para usar en toda la app
  get token(): string {
    return localStorage.getItem('token') || '';
  }

  /**
   * 🔑 Login Tradicional
   */
  login(body: any) {
    return this.http.post<any>(`${apiUrl}/auth/login`, body).pipe(
      tap(resp => {
        if (resp.ok) {
          localStorage.setItem('token', resp.token);
        }
      })
    );
  }

  /**
   * ♻️ Renovar Token (Para mantener la sesión activa al abrir la app)
   */
  validarToken(): Observable<boolean> {
    const headers = { 'x-token': this.token };

    return this.http.get<any>(`${apiUrl}/auth/renew`, { headers }).pipe(
      map(resp => {
        localStorage.setItem('token', resp.token);
        return true;
      }),
      catchError(() => {
        localStorage.removeItem('token');
        return of(false);
      })
    );
  }

  /**
   * 🚪 Cerrar Sesión
   */
  logout() {
    localStorage.removeItem('token');
  }
}
