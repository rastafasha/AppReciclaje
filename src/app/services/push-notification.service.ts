import { inject, Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { ToastController } from '@ionic/angular'; // 🟢 INYECTADO: Manejo nativo de alertas de Ionic

const claveVapidApi = environment.VAPI_KEY_PUBLIC;
const urlBackend = `${environment.apiUrl}/notificaciones/suscribir`;

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  readonly VAPID_PUBLIC_KEY = claveVapidApi;

  private swPush = inject(SwPush);
  private http = inject(HttpClient);
  public router = inject(Router);
  private toastController = inject(ToastController); // Instanciamos el controlador de Toasts

  // Observables reactivos para mapear el estado del interruptor
  public isSubscribed$ = new BehaviorSubject<boolean>(false);
  public isProcessing$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.checkSubscriptionStatus();
  }

  async checkSubscriptionStatus() {
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        this.isSubscribed$.next(!!sub);
      }
    } catch (err) {
      console.warn('⚠️ [WEBPUSH]: El Service Worker no está listo todavía.', err);
      this.isSubscribed$.next(false);
    }
  }

  /**
   * 📲 DISPARADOR: Solicita permisos al navegador y enlaza el token en Atlas
   */
  subscribeToNotifications() {
    this.isProcessing$.next(true);
    
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
    .then(sub => {
      // Extraemos el objeto usuario del localStorage de forma segura
      const userString = localStorage.getItem('user');
      const userObj = userString ? JSON.parse(userString) : null;
      const currentUid = userObj && userObj.uid ? userObj.uid.toString() : 'ADMIN';
      const miToken = localStorage.getItem('token') || '';

      const subJson = sub.toJSON();

      // Configuramos el formato de payload plano requerido por el backend en Node
      const payloadBody = {
        endpoint: subJson.endpoint,
        expirationTime: subJson.expirationTime,
        keys: subJson.keys,
        userId: currentUid 
      };

      const headers = {
        'x-token': miToken,
        'x-uid': currentUid
      };
      
      console.log('📡 [PWA ADMIN] Sincronizando credenciales push para el ID:', currentUid);

      this.http.post(urlBackend, payloadBody, { headers }).subscribe({
        next: async () => {
          console.log('✅ ¡Suscripción de administrador guardada con éxito en MongoDB!');
          this.isSubscribed$.next(true);
          this.isProcessing$.next(false);

          // 🟢 ALERTA NATIVA: Desplegamos el Toast de éxito de Ionic
          const toastExito = await this.toastController.create({
            message: '¡Notificaciones activadas con éxito! ♻️',
            duration: 3000,
            position: 'bottom',
            color: 'success',
            icon: 'checkmark-circle-outline'
          });
          await toastExito.present();

          // =========================================================================
          // 🛡️ GLOBO PUSH INMEDIATO CON CONTROL DE PERMISOS (Anti-caídas)
          // =========================================================================
          if ('serviceWorker' in navigator && Notification.permission === 'granted') {
            navigator.serviceWorker.ready.then((registration) => {
              const opcionesNotificacion: any = {
                body: 'Consola de control ambiental de Mercadona enlazada correctamente.',
                icon: 'assets/icons/icon-72x72.png', 
                badge: 'assets/icons/icon-72x72.png',
                vibrate:[200,100,200],
                tag: 'bienvenida-admin-reciclaje'
              };

              registration.showNotification('♻️ Canal Administrativo Conectado', opcionesNotificacion);
            }).catch(swErr => console.log('Aviso: Service Worker no listo para el globo:', swErr));
          }
          // =========================================================================
        },
        error: async err => {
          console.error('❌ Error al guardar la suscripción en Atlas:', err);
          this.isSubscribed$.next(false);
          this.isProcessing$.next(false);

          const toastError = await this.toastController.create({
            message: 'Error de registro. El servidor no pudo almacenar la sesión push.',
            duration: 3500,
            position: 'bottom',
            color: 'danger',
            icon: 'alert-circle-outline'
          });
          await toastError.present();
        }
      });
    })
    .catch(async err => {
      console.error('❌ Permiso denegado en el banner VAPID:', err);
      this.isSubscribed$.next(false);
      this.isProcessing$.next(false);

      const toastAdvertencia = await this.toastController.create({
        message: 'Permiso denegado. Actívalo en los ajustes de tu navegador.',
        duration: 3500,
        position: 'bottom',
        color: 'warning',
        icon: 'notifications-off-outline'
      });
      await toastAdvertencia.present();
    });
  }
}