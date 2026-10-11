import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { notificationsOutline, menuOutline } from 'ionicons/icons';
import { IonContent, } from '@ionic/angular';
import { HeaderComponent } from '../../shared/header/header.component';
import { AuthService } from '../../services/auth';
import { HojaAnimadaComponent } from '../../components/hoja-animada/hoja-animada.component';

@Component({
  selector: 'app-bienvenida',
  templateUrl: './bienvenida.page.html',
  styleUrls: ['./bienvenida.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, RouterModule, HeaderComponent, HojaAnimadaComponent]
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

  public estadoActual = signal<any>('saludando');

  constructor() {
    addIcons({ notificationsOutline, menuOutline });

    // 👁️ OBSERVADOR REACTIVO EN CALIENTE:
    // Se ejecuta automáticamente cada vez que las signals del AuthService cambien de estado.
    effect(() => {
      const usuario = this.authService.usuarioActual();
      const completo = this.authService.isProfileComplete();

      // Si el usuario no está autenticado, no procesamos redirecciones aquí
      if (!usuario) return;

      // Si detectamos que los datos del perfil ya se rehidrataron desde Atlas 
      // y cumplen con los requisitos mínimos, lo enviamos de inmediato a inicio
      if (completo) {
        console.log('🚀 Observador: Perfil completo detectado en Atlas. Redirigiendo a Inicio.');
        this.router.navigateByUrl('/inicio');
      } else {
        console.log('📝 Observador: El perfil requiere atención. El usuario permanece en Bienvenida.');
      }
    });
  }

  irACompletarPerfil() {
    this.router.navigateByUrl('/perfil-editar');
  }

  irANotificaciones() {
    this.router.navigateByUrl('/historial');
  }
}
