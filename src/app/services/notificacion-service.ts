// src/app/core/services/notification.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker'; // 🚀 El puente nativo con el Service Worker
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { NotificationResponse } from '../models/notificacion.model';

const apiUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private swPush = inject(SwPush);

  // 🧪 Llave Pública VAPID de tu archivo .env (¡Pégala aquí exactamente igual!)
  private readonly VAPID_PUBLIC_KEY = 'TU_LLAVE_PUBLICA_VAPID_AQUI';

  private get headers() {
    return {
      headers: {
        'x-token': localStorage.getItem('token') || ''
      }
    };
  }

  /**
   * 📋 1. Obtener la lista de notificaciones tradicionales en la campana
   * GET /api/notificaciones/pendientes
   */
  getNotificacionesPendientes(): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(`${apiUrl}/notificaciones/pendientes`, this.headers);
  }

  /**
   * 📝 2. Marcar una alerta como leída al hacerle clic
   * PUT /api/notificaciones/marcar-leida/:id
   */
  marcarComoLeida(id: string): Observable<any> {
    return this.http.put<any>(`${apiUrl}/notificaciones/marcar-leida/${id}`, {}, this.headers);
  }

  /**
   * 📲 3. CORE PUSH: Suscribir el dispositivo al Service Worker y enlazar con Atlas
   */
  solicitarPermisoYRegistrarDispositivo(): Observable<any> {
    // Convertimos la Promesa nativa del navegador en un flujo Observable de Angular
    return from(
      this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
      })
    ).pipe(
      switchMap((suscripcionObj: PushSubscription) => {
        console.log('📦 Suscripción WebPush generada por el terminal:', suscripcionObj);
        
        // Enviamos el objeto completo (endpoint, keys) hacia tu controlador POST
        return this.http.post<any>(
          `${apiUrl}/notificaciones/guardar-suscripcion`, 
          suscripcionObj.toJSON(), 
          this.headers
        );
      })
    );
  }
}
