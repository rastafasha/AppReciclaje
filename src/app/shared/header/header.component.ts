import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
// 🚀 Ajustado a las APIs Standalone oficiales de Ionic
import { addIcons } from 'ionicons';
import { notificationsOutline, menuOutline, logOutOutline } from 'ionicons/icons';
import { IonHeader, IonToolbar, IonIcon, IonMenuToggle, IonBadge, IonButton } from '@ionic/angular';
import { NotificationService } from '../../services/notificacion-service';
import { PushNotificationService } from '../../services/push-notification.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true, // 🚀 Declaramos formalmente el modo standalone
  imports: [CommonModule, IonHeader, IonToolbar, IonIcon, IonMenuToggle, IonBadge, RouterModule, IonButton]
})
export class HeaderComponent implements OnInit {
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  public pushService = inject(PushNotificationService);
  private authService = inject(AuthService);

  // Computed reactivo: si NO está completo el perfil, se considera "enRegistro"
  public get enRegistro(): boolean {
    return !this.authService.isProfileComplete();
  }

  // 🚦 Signal que controla el número flotante de la campana
  public contadorAlertas = signal<number>(0);


  constructor() {
    addIcons({ notificationsOutline, menuOutline, logOutOutline });
  }

  

  ngOnInit() {

    // Si está bloqueado en registro, frenamos la consulta de alertas para ahorrar recursos
    if (this.enRegistro) return;

    // 🌟 ESCUCHA EN TIEMPO REAL: Cada vez que el servicio cambie el valor, la campana se entera
    this.notificationService.contadorAlertas$.subscribe((nuevoContador) => {
      this.contadorAlertas.set(nuevoContador);
    });

    // Petición inicial reglamentaria para poblar el Subject
    this.notificationService.actualizarContadorBackend();

    this.notificacionesPendientes();
  }

  notificacionesPendientes(){
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
    if (this.enRegistro) return;
    this.router.navigateByUrl('/notificaciones');
  }

  // 🚪 Acción directa de salida segura
  logout() {
    this.authService.logout();

    // 3. Redirección limpia al Login
    this.router.navigateByUrl('/login');
  }
}
