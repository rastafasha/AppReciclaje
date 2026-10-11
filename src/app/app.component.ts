import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonContent, IonIcon, IonMenu, IonRouterOutlet, MenuController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trophyOutline, documentTextOutline, powerOutline, chevronForwardOutline, ribbonOutline } from 'ionicons/icons';
import { AuthService } from './services/auth';
import { PwaNotifInstallerComponent } from './shared/pwa-notif-installer/pwa-notif-installer.component';
import { ImagenPipe } from './pipes/imagen.pipe';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet, IonMenu, IonContent, IonIcon, PwaNotifInstallerComponent, ImagenPipe]
})
export class AppComponent {
  private router = inject(Router);
  private menuCtrl = inject(MenuController);

  public authService = inject(AuthService);
  // public avatarPreview = signal<string>('assets/images/default.jpeg');
  public imgTemp = signal<string | ArrayBuffer | null>(null);
  public avatarUrl = signal<string>('');
  public nombreUsuario = computed(() => {
    const user = this.authService.usuarioActual();

    // 1. Si la señal ya se rehidrató desde Atlas, tomamos el valor en caliente
    if (user) {
      return user.profile?.first_name || user.username || 'Usuario';
    }

    // 2. 🛡️ FALLBACK EN FRÍO: Si la señal aún está en null por retraso de red,
    // extraemos temporalmente el nombre del usuario o su correo desde el localStorage
    const tokenToken = localStorage.getItem('token');
    if (tokenToken) {
      // Intentamos recuperar el string de usuario si lo guardaste en disco,
      // o devolvemos un texto genérico de bienvenida para que nunca quede vacío.
      return 'Retador';
    }

    return 'Usuario';
  });

  constructor() {
    addIcons({ chevronForwardOutline, ribbonOutline, documentTextOutline, powerOutline});
  }

  navegarA(ruta: string) {
    this.menuCtrl.close('main-menu'); // Cerramos el panel antes de saltar
    this.router.navigateByUrl(`/${ruta}`);
  }

  abrirSoporte() {
    console.log('💬 Abriendo canal de chat directo con los administradores de UCC');
    this.menuCtrl.close('main-menu');
  }

  cerrarSesion() {
  // Cerrar el menú lateral de Ionic
  this.menuCtrl.close('main-menu');
  
  console.log('🧼 Ejecutando limpieza profunda desde el componente...');
  
  // 2. 🔥 LLAMADA CLAVE: Esto borra token, profile_complete y resetea las Signals en RAM al instante
  this.authService.logout(); 
  
  // 3. Redirección limpia al Login
  this.router.navigateByUrl('/login');
}
}
