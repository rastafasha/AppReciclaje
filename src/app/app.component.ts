import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonContent, IonIcon, IonMenu, IonRouterOutlet, MenuController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trophyOutline, documentTextOutline, powerOutline, chevronForwardOutline, ribbonOutline } from 'ionicons/icons';
import { AuthService } from './services/auth';
import { PwaNotifInstallerComponent } from './shared/pwa-notif-installer/pwa-notif-installer.component';
import { ImagenPipe } from './pipes/imagen.pipe';
import { SocketService } from './services/socket-service';
import { SwPush } from '@angular/service-worker'; // 🚀 IMPORTANTE: Inyectamos el oidor nativo de Push de Angular

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet, IonMenu, IonContent, IonIcon, PwaNotifInstallerComponent, ImagenPipe]
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private menuCtrl = inject(MenuController);
  public authService = inject(AuthService);
  private socketService = inject(SocketService);
  private swPush = inject(SwPush); // 🚀 Inyección limpia de Angular

  public imgTemp = signal<string | ArrayBuffer | null>(null);
  public avatarUrl = signal<string>('');

  public nombreUsuario = computed(() => {
    const user = this.authService.usuarioActual();
    if (user) {
      return user.profile?.first_name || user.username || 'Usuario';
    }
    const tokenToken = localStorage.getItem('token');
    if (tokenToken) {
      return 'Retador';
    }
    return 'Usuario';
  });

  constructor() {
    addIcons({ chevronForwardOutline, ribbonOutline, documentTextOutline, powerOutline, trophyOutline });
  }

  ngOnInit() {
    console.log('♻️ Inicializando Core de la App de Reciclaje.');

    // 🎯 EL SENSOR DE PUSH EN PRODUCCIÓN:
    // Captura el clic físico sobre el globo flotante cuando la PWA está en segundo plano o cerrada
    if (this.swPush.isEnabled) {
      this.swPush.notificationClicks.subscribe({
        next: (clickEvent: any) => {
          console.log('📱 [WEBPUSH CLICK]: Se presionó el globo flotante en el centro de notificaciones.', clickEvent);
          
          // Extraemos de forma segura la URL de redirección que inyectamos desde Node.js (VAPID data)
          const rutaDestino = clickEvent.notification.data?.url || '/notificaciones';
          
          console.log(`🚀 Redirigiendo participante de forma directa hacia: ${rutaDestino}`);
          this.router.navigateByUrl(rutaDestino);
        },
        error: (err) => console.error('❌ Error capturando clic del Service Worker:', err)
      });
    }
  }

  navegarA(ruta: string) {
    this.menuCtrl.close('main-menu');
    this.router.navigateByUrl(`/${ruta}`);
  }

  abrirSoporte() {
    console.log('💬 Abriendo canal de chat directo con los administradores de UCC');
    this.menuCtrl.close('main-menu');
  }

  cerrarSesion() {
    this.menuCtrl.close('main-menu');
    console.log('🧼 Ejecutando limpieza profunda desde el componente...');
    this.authService.logout(); 
    this.router.navigateByUrl('/login');
  }
}