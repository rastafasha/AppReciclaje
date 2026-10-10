import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map, catchError, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { IUsuario } from '../models/usuario.model';

const apiUrl = environment.apiUrl

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  // Signal privado que almacena el token actual de MongoDB / Node
  private _token = signal<string | null>(localStorage.getItem('token'));
  private _usuarioActual = signal<IUsuario | null>(null);

  // Signal público y computado de solo lectura para el Front y los Guards
  public isAuthenticated = computed(() => !!this._token());
  public usuarioActual = computed(() => this._usuarioActual());

  // Signal computado para verificar la regla de negocio: si ya completó su pseudónimo/familiares
  // Nota: Evaluamos si el perfil ya existe en el objeto populado
  // Signal computado inteligente para saber si el usuario pasó por el onboarding
  public isProfileComplete = computed(() => {
    const user = this._usuarioActual();
    if (!user || !user.profile || typeof user.profile === 'string') return false;

    const perfil = user.profile as any;
    return !!(perfil.phone_mobile && perfil.phone_mobile.trim() !== '');
  });

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
        // 🔍 ¡DEPURACIÓN CLAVE! Revisa qué te está respondiendo exactamente el backend
        console.log('📦 Respuesta cruda del Backend en Login:', resp);

        if (resp.ok) {
          // Buscamos el token de forma flexible por si el backend lo nombró diferente
          const tokenToken = resp.token;
          const usuarioData = resp.user;

          if (tokenToken) {
            localStorage.setItem('token', tokenToken);
            this.setSession(tokenToken);
          }

          if (usuarioData) {
            this._usuarioActual.set(usuarioData);

            // Si viene ID plano (string), la bandera inicial es false
            const isString = typeof usuarioData.profile === 'string';
            const complete = !isString && !!(usuarioData.profile && usuarioData.profile.first_name);
            localStorage.setItem('profile_complete', String(complete));
          }
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
      switchMap(resp => {
        // 🚀 CORREGIDO: Tu backend envía 'user', no 'usuario'
        if (!resp.ok || !resp.user) return of(false);

        localStorage.setItem('token', resp.token);

        const usuarioData = resp.user;

        // 🧠 SI EL BACKEND ENVIÓ EL PROFILE COMO UN STRING ID AL RENOVAR:
        if (typeof usuarioData.profile === 'string') {
          return this.http.get<any>(`${apiUrl}/usuarios/user_profile/${usuarioData.uid}`).pipe(
            map(profileResp => {
              usuarioData.profile = profileResp.profile;
              this._usuarioActual.set(usuarioData); // 🔥 Rehidratamos la Signal con el objeto populado
              
              localStorage.setItem('profile_complete', String(this.isProfileComplete()));
              return true;
            }),
            catchError(() => {
              this._usuarioActual.set(usuarioData);
              return of(true);
            })
          );
        }

        // Si ya venía populado por defecto
        this._usuarioActual.set(usuarioData);
        localStorage.setItem('profile_complete', String(this.isProfileComplete()));
        return of(true);
      }),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  // Método para el login exitoso
  setSession(token: string): void {
    localStorage.setItem('token', token);
    this._token.set(token);
  }



  cargarSesionPersistente(): Promise<boolean> {
    if (!this.token) {
      return Promise.resolve(false);
    }
    return new Promise((resolve) => {
      this.validarToken().subscribe({
        next: (valido) => resolve(valido),
        error: () => resolve(false)
      });
    });
  }

  /**
   * 🚪 Cerrar Sesión
   */
  logout() {
    // 🧼 Borramos TODOS los rastros del disco duro para evitar confusión entre cuentas
    localStorage.removeItem('token');
    localStorage.removeItem('profile_complete');

    // Reseteamos las Signals en memoria RAM
    this._token.set(null);
    this._usuarioActual.set(null);
  }
}
