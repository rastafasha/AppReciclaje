import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const apiUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);

  // Cabecera con tu token para el middleware validarJWT
  private get headers() {
    return {
      headers: {
        'x-token': localStorage.getItem('token') || ''
      }
    };
  }

  /**
   * 👤 Obtener el perfil del usuario autenticado (mediante el token)
   * GET /api/perfiles/mi-perfil
   */
  getMiPerfil(): Observable<any> {
    return this.http.get<any>(`${apiUrl}/perfiles/mi-perfil`, this.headers);
  }

  /**
   * 📝 Actualizar la información personal del perfil (first_name, last_name, phone)
   * PUT /api/perfiles/actualizar
   */
  actualizarPerfil(data:any): Observable<any> {
    return this.http.put<any>(`${apiUrl}/perfiles/actualizar`, data, this.headers);
  }
}