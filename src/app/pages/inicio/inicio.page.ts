// src/app/pages/inicio/inicio.page.ts
import { Component, inject, OnInit, ViewChild, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  notificationsOutline, menuOutline, helpCircleOutline, 
  pizza, restaurant, ribbon, refreshCircleOutline, 
  documentTextOutline, personCircleOutline 
} from 'ionicons/icons';
import { IonContent, IonButton, IonIcon, IonModal } from '@ionic/angular';
import { MiPuntajeComponent } from '../../components/mi-puntaje/mi-puntaje.component';
import { FormularioAvanceComponent } from '../../components/formulario-avance/formulario-avance.component';
import { MaterialesService } from '../../services/materiales';
import { HeaderComponent } from '../../shared/header/header.component';
import { MenufooterComponent } from '../../shared/menufooter/menufooter.component';
import { AuthService } from '../../services/auth';
import { SkeletonLoaderComponent } from '../../shared/skeleton-loader/skeleton-loader.component'; // 🚀 Inyectamos tu autenticación

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent,
    IonButton, IonIcon, RouterModule,
    FormularioAvanceComponent, MiPuntajeComponent, IonModal,
    HeaderComponent, MenufooterComponent, SkeletonLoaderComponent]
})
export class InicioPage implements OnInit {
  private router = inject(Router);
  private materialesService = inject(MaterialesService);
  private authService = inject(AuthService); // ⚙️ Instanciamos el servicio de sesión

  // 🚦 Signal computado para extraer el nombre personalizado del saludo
  // Prioriza el first_name del perfil extendido y usa el username como fallback
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
  public isLoading = signal<boolean>(false);

  // Enlazamos las signals computadas para el HTML existentes
  public rango = this.materialesService.rangoActual;
  public totalComidas = this.materialesService.totalRegistros;

  @ViewChild('modalAvance') modalAvance!: IonModal;
  @ViewChild('modalPuntaje') modalPuntaje!: IonModal;

  constructor() {
    addIcons({ 
      notificationsOutline, menuOutline, helpCircleOutline, 
      pizza, restaurant, ribbon, refreshCircleOutline, 
      documentTextOutline, personCircleOutline 
    }); //
  }

  ngOnInit() {
    this.isLoading.set(true);
    console.log('🏠 Tablero de Inicio cargado para el usuario:', this.nombreUsuario());
    
    // ⚡ Mandamos a pedir la data real del historial de reciclaje en Atlas al inicializar
    this.materialesService.getHistorial().subscribe(); //
    this.isLoading.set(false);
  }

  irAFormulario() {
    this.router.navigateByUrl('/formulario-avance'); //
  }

  verMiPuntaje() {
    this.router.navigateByUrl('/mi-puntaje'); //
  }

  irAlConsejos() {
    this.router.navigateByUrl('/consejos'); //
  }

  irAlHistorial() {
    this.router.navigateByUrl('/historial'); //
  }

  irAHistorial() {
    this.router.navigateByUrl('/historial'); //
  }
}
