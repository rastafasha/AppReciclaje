// src/app/core/services/notification.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker'; // 🚀 El puente nativo con el Service Worker
import { BehaviorSubject, Observable, from } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { NotificationResponse } from '../models/notificacion.model';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

const apiUrl = environment.apiUrl;
const vapiKey = environment.VAPI_KEY_PUBLIC;

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private swPush = inject(SwPush);
  private router = inject(Router);
  private toastController = inject(ToastController);
  public estaSuscrito$ = new BehaviorSubject<boolean>(false);
  public contadorAlertas$ = new BehaviorSubject<number>(0);
  // 🚀 LA VARIABLE DE TRANSFERENCIA ASÍNCRONA: Guarda la alerta en espera de ser abierta
  public alertaPendientePorAbrir = signal<any | null>(null);
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
    // Escuchar notificaciones Push nativas en caliente si la app está en primer plano
    this.swPush.messages.subscribe(() => {
      this.actualizarContadorBackend();
    });
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
   * 🔄 Método maestro para re-sincronizar el contador global desde el servidor
   */
  actualizarContadorBackend() {
    this.getNotificacionesPendientes().subscribe({
      next: (resp) => {
        if (resp.ok && resp.alertas) {
          const noLeidas = resp.alertas.filter((a: any) => !a.leido).length;
          this.contadorAlertas$.next(noLeidas);
        }
      }
    });
  }

  /**
   * 📋 1. Obtener la lista de notificaciones tradicionales en la campana
   * GET /api/notificaciones/pendientes
   */
  getNotificacionesPendientes(): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(`${apiUrl}/notificaciones/pendientes`, this.headers).pipe(
      tap(resp => {
        if (resp.ok && resp.alertas) {
          const noLeidas = resp.alertas.filter((a: any) => !a.leido).length;
          this.contadorAlertas$.next(noLeidas);
        }
      })
    );
  }
  getNotificacionesLeidas(desde: number = 0): Observable<NotificationResponse> {
  // Pasamos el parámetro 'desde' en la URL tal como lo configuramos en el backend de Node.js
  return this.http.get<NotificationResponse>(
    `${apiUrl}/notificaciones/leidas?desde=${desde}`, 
    this.headers
  );
}

  /**
   * 📝 2. Marcar una alerta como leída al hacerle clic
   * PUT /api/notificaciones/marcar-leida/:id
   */
  marcarComoLeida(id: string): Observable<any> {
    return this.http.put<any>(`${apiUrl}/notificaciones/marcar-leida/${id}`, {}, this.headers).pipe(
      tap(() => {
        // Reducimos el contador local de inmediato para dar feedback instantáneo
        const actual = this.contadorAlertas$.value;
        if (actual > 0) this.contadorAlertas$.next(actual - 1);
      })
    );
  }
  marcarComoLeidaTodas(): Observable<any> {
    return this.http.put<any>(`${apiUrl}/notificaciones/marcar-todas-leidas`, {}, this.headers).pipe(
      tap(() => this.contadorAlertas$.next(0)) // Reseteo total instantáneo
    );
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
              vibrate: [200, 100, 200], // Patrón de vibración estándar de la PWA
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

  /**
   * 📡 VERIFICADOR EN CALIENTE DE ALERTAS AMBIENTALES IN-APP
   * Escanea Atlas en busca de novedades para pintarlas en la pantalla actual del usuario
   */
  checkUnreadNotificationsInApp() {
  const opcionesHeaders = {
    headers: { 'x-token': localStorage.getItem('token') || '' }
  };

  this.http.get<{ ok: boolean, alertas: any[] }>(
    `${apiUrl}/notificaciones/pendientes`, 
    opcionesHeaders
  ).subscribe({
    next: (res) => {
      if (res.ok && res.alertas && res.alertas.length > 0) {
        
        res.alertas.forEach(async (notif) => {
          let colorToast = 'primary';
          let tituloToast = '🔔 Notificación';

          // ♻️ Homologación semántica total con tus colecciones de Atlas
          switch (notif.tipo) {
            case 'SORTEO':
              colorToast = 'success';
              tituloToast = '🎉 ¡Nuevo Sorteo UCC!';
              break;
            case 'PREMIO_MERCADONA':
              colorToast = 'tertiary';
              tituloToast = '🛒 Recompensa Mercadona';
              break;
            case 'URGENTE':
              colorToast = 'danger';
              tituloToast = '⚠️ Alerta Prioritaria';
              break;
            default:
              colorToast = 'primary';
              tituloToast = '♻️ Reto Eco Aviso';
          }

           const toast = await this.toastController.create({
              header: tituloToast,
              message: notif.mensaje,
              position: 'top',
              color: colorToast,
              duration: 5000,
              buttons: [
                {
                  text: 'Ver',
                  handler: () => {
                    // 🎯 SOLUCIÓN: En lugar de marcar como leída a ciegas en Atlas, 
                    // guardamos el objeto completo en la Signal y redirigimos de forma limpia
                    this.alertaPendientePorAbrir.set(notif);
                    this.router.navigateByUrl('/notificaciones'); 
                  }
                }
              ]
            });
          await toast.present();
        });
      }
    }
  });
}


}
