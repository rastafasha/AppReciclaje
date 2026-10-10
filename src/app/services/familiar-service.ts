import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IFamiliar, FamiliarResponse } from '../models/familiar.model';

const apiUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class FamiliarService {
  private http = inject(HttpClient);

  // 🛡️ Getter centralizado para adjuntar el x-token que requiere validarJWT
  private get headers() {
    return {
      headers: {
        'x-token': localStorage.getItem('token') || ''
      }
    };
  }

  /**
   * 🔄 Actualizar datos de un familiar existente
   * PUT /api/familiareseditar/:id
   */
  actualizarFamiliar(id: string, body: IFamiliar): Observable<FamiliarResponse> {
    return this.http.put<FamiliarResponse>(
      `${apiUrl}/familiares/editar/${id}`,
      body,
      this.headers
    );
  }

  /**
   * 🗑️ Eliminar un familiar permanentemente de la base de datos
   * DELETE /api/familiaresborrar/:id
   */
  borrarFamiliar(id: string): Observable<FamiliarResponse> {
    return this.http.delete<FamiliarResponse>(
      `${apiUrl}/familiares/borrar/${id}`,
      this.headers
    );
  }

  /**
   * 🆕 Crear y guardar un familiar independiente en Atlas
   * POST /api/familiar/crear
   */
  crearFamiliar(body: IFamiliar): Observable<FamiliarResponse> {
    return this.http.post<FamiliarResponse>(
      `${apiUrl}/familiares/crear`, 
      body, 
      this.headers
    );
  }
  

  /**
   * 📋 Listar únicamente los familiares del usuario logueado
   * GET /api/familiares/listar
   */
  obtenerFamiliares(): Observable<FamiliarResponse> {
    return this.http.get<FamiliarResponse>(
      `${apiUrl}/familiares/listar`, 
      this.headers
    );
  }


}
