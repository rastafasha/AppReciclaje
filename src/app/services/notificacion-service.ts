// src/app/core/services/notification.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker'; // 🚀 El puente nativo con el Service Worker
import { BehaviorSubject, Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { NotificationResponse } from '../models/notificacion.model';

const apiUrl = environment.apiUrl;
const vapiKey = environment.VAPI_KEY_PUBLIC;

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private swPush = inject(SwPush);
  public estaSuscrito$ = new BehaviorSubject<boolean>(false);

  // 🧪 Llave Pública VAPID de tu archivo .env (¡Pégala aquí exactamente igual!)
  private readonly VAPID_PUBLIC_KEY = vapiKey;

  private get headers() {
    return {
      headers: {
        'x-token': localStorage.getItem('token') || ''
      }
    };
  }
  constructor() {
  this.verificarEstadoSuscripcion();
}

/**
 * 🕵️‍♂️ Pregunta al navegador si el Service Worker ya cuenta con un token WebPush activo
 */
async verificarEstadoSuscripcion() {
  try {
    if ('serviceWorker' in navigator) {
      const registro = await navigator.serviceWorker.ready;
      const suscripcion = await registro.pushManager.getSubscription();
      this.estaSuscrito$.next(!!suscripcion);
    }
  } catch (err) {
    this.estaSuscrito$.next(false);
  }
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
  marcarComoLeidaTodas(): Observable<any> {
    // 🟢 CORRECCIÓN: El objeto vacío {} ocupa el lugar del body, permitiendo que headers viaje en el tercer parámetro
    return this.http.put<any>(`${apiUrl}/notificaciones/marcar-todas-leidas`, {}, this.headers);
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
      
      // 1. Encendemos el interruptor de forma reactiva e instantánea
      this.estaSuscrito$.next(true);

      // 2. Disparamos el globo de bienvenida aprovechando el clic en caliente del usuario
      if ('serviceWorker' in navigator && Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then((registration) => {
          
          // 🟢 CORRECCIÓN: Forzamos el tipo 'any' para evitar que el linter bloquee la propiedad vibrate
          const opcionesNotificacion: any = {
            body: 'Recibirás avisos instantáneos cada vez que clasifiques a un sorteo o acumules puntos.',
            icon: 'assets/icons/icon-72x72.png',
            badge: 'assets/icons/icon-72x72.png',
            vibrate:[200, 100, 200], // Patrón de vibración estándar de la PWA
            tag: 'bienvenida-gamificacion'
          };

          registration.showNotification('🔔 Canal Eco-Tech Conectado', opcionesNotificacion);
        }).catch(err => console.log('SW no listo:', err));
      }

      // Enviamos el objeto completo (endpoint, keys) hacia tu controlador POST
      return this.http.post<any>(
        `${apiUrl}/notificaciones/suscribir`,
        suscripcionObj.toJSON(),
        this.headers
      );
    })
  );
}


}
