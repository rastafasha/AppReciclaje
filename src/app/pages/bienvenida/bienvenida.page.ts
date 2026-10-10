import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { notificationsOutline, menuOutline } from 'ionicons/icons';
import { IonButton, IonContent, } from '@ionic/angular';
import { HeaderComponent } from '../../shared/header/header.component';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-bienvenida',
  templateUrl: './bienvenida.page.html',
  styleUrls: ['./bienvenida.page.scss'],
  standalone: true,
  imports: [CommonModule,  IonContent, IonButton,  RouterModule, HeaderComponent]
})
export class BienvenidaPage {
  private router = inject(Router);
  private authService = inject(AuthService);

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
    // Registramos los iconos nativos de Ionicons que se muestran en la barra superior
    addIcons({ notificationsOutline, menuOutline });
  }

  irACompletarPerfil() {
    this.router.navigateByUrl('/perfil-editar');
  }

  irANotificaciones() {
    this.router.navigateByUrl('/historial');
  }
}
