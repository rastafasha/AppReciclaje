import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { notificationsOutline, menuOutline, refreshCircleOutline, documentTextOutline, personCircleOutline } from 'ionicons/icons';
import { IonContent} from '@ionic/angular';
import { HeaderComponent } from '../../shared/header/header.component';
import { MenufooterComponent } from '../../shared/menufooter/menufooter.component';
import { BackbuttonComponent } from '../../shared/backbutton/backbutton.component';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-reglas',
  templateUrl: './reglas.page.html',
  styleUrls: ['./reglas.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, HeaderComponent, MenufooterComponent, BackbuttonComponent]
})
export class ReglasPage {
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
    addIcons({ notificationsOutline, menuOutline, refreshCircleOutline, documentTextOutline, personCircleOutline });
  }

  irANotificaciones() {
    this.router.navigateByUrl('/notificaciones');
  }

  irAlInicio() {
    this.router.navigateByUrl('/inicio');
  }

  irAConsejos() {
    this.router.navigateByUrl('/consejos');
  }
  irAReglas() {
    this.router.navigateByUrl('/reglas');
  }

  irAlPerfil() {
    this.router.navigateByUrl('/perfil-editar');
  }
}
