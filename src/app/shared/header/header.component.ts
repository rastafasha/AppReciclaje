import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
// 🚀 Ajustado a las APIs Standalone oficiales de Ionic
import { addIcons } from 'ionicons';
import { notificationsOutline, menuOutline } from 'ionicons/icons';
import { IonHeader, IonToolbar, IonIcon, IonMenuToggle, IonBadge } from '@ionic/angular';
import { NotificationService } from '../../services/notificacion-service';
import { PushNotificationService } from '../../services/push-notification.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true, // 🚀 Declaramos formalmente el modo standalone
  imports: [CommonModule, IonHeader, IonToolbar, IonIcon, IonMenuToggle, IonBadge, RouterModule]
})
export class HeaderComponent implements OnInit{
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  public pushService = inject(PushNotificationService);
  
  // 🚦 Signal que controla el número flotante de la campana
  public contadorAlertas = signal<number>(0);

  constructor() {
    addIcons({ notificationsOutline, menuOutline });
  }

  ngOnInit() {
    // Consultamos al servidor cuántos mensajes tiene pendientes este usuario logueado
    this.notificationService.getNotificacionesPendientes().subscribe({
      next: (resp: any) => {
        if (resp.ok && resp.alertas) {
          this.contadorAlertas.set(resp.alertas.length);
        }
      }
    });
  }

  /**
   * 📲 Gatillo del ion-toggle de la barra superior
   */
  alternarNotificacionesPush(event: any): void {
    const encendido = event.detail.checked;

    // Si está encendido y el servicio reporta que no hay suscripción activa, disparamos el banner VAPID
    if (encendido && !this.pushService.isSubscribed$.value) {
      this.pushService.subscribeToNotifications();
    }
  }


  irANotificaciones() {
    this.router.navigateByUrl('/notificaciones');
  }
}
