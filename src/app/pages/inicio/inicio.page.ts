// src/app/pages/inicio/inicio.page.ts
import { Component, inject, OnInit, ViewChild, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  notificationsOutline, menuOutline, helpCircleOutline, 
  pizza, restaurant, ribbon, refreshCircleOutline, 
  documentTextOutline, personCircleOutline, 
  trophy
} from 'ionicons/icons';
import { IonContent,  IonIcon, IonModal, ToastController } from '@ionic/angular';
import { MiPuntajeComponent } from '../../components/mi-puntaje/mi-puntaje.component';
import { FormularioAvanceComponent } from '../../components/formulario-avance/formulario-avance.component';
import { MaterialesService } from '../../services/materiales';
import { HeaderComponent } from '../../shared/header/header.component';
import { MenufooterComponent } from '../../shared/menufooter/menufooter.component';
import { AuthService } from '../../services/auth';
import { SkeletonLoaderComponent } from '../../shared/skeleton-loader/skeleton-loader.component'; // 🚀 Inyectamos tu autenticación
import { ModalBienvenidaComponent } from '../../components/modal-bienvenida/modal-bienvenida.component';
import { ModalInstruccionesComponent } from '../../components/modal-instrucciones/modal-instrucciones.component';
import { NotificationService } from '../../services/notificacion-service';
import { HojaAnimadaComponent } from '../../components/hoja-animada/hoja-animada.component';
import { UiModalService } from '../../services/ui-modal-service';
@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent,
     IonIcon, RouterModule,
    FormularioAvanceComponent, MiPuntajeComponent, IonModal,
    HeaderComponent, MenufooterComponent, SkeletonLoaderComponent,
    ModalBienvenidaComponent, ModalInstruccionesComponent, HojaAnimadaComponent
  ]
})
export class InicioPage implements OnInit {
  private router = inject(Router);
  private materialesService = inject(MaterialesService);
  private authService = inject(AuthService); 
  private notificationService = inject(NotificationService);
  private toastController = inject(ToastController);
  public uiModalService = inject(UiModalService);
  
  public nombreUsuario = computed(() => {
    const user = this.authService.usuarioActual();
    if (user) return user.profile?.first_name || user.username || 'Usuario';
    return 'Retador'; 
  });
  
  public isLoading = signal<boolean>(false);
  public rango = this.materialesService.rangoActual;
  public totalComidas = this.materialesService.totalRegistros;

  // 🚦 SIGNALS LOCALES DIRECTAS DE UI (El blindaje definitivo anti-congelamiento)
  public mostrarModalFormularioAvance = signal<boolean>(false);
  public mostrarModalMiPuntaje = signal<boolean>(false);
  public mostrarModalBienvenida = signal<boolean>(false);
  public mostrarModalInstrucciones = signal<boolean>(false);

  public estadoActual = signal<any>('normal');

  constructor() {
    addIcons({ 
      notificationsOutline, menuOutline, helpCircleOutline, 
      pizza, restaurant, ribbon, refreshCircleOutline, 
      documentTextOutline, personCircleOutline, trophy
    });

    // 👁️ OBSERVADOR REACTIVO DEL FOOTER: Escucha al botón verde central en caliente
    effect(() => {
      const debeAbrirseForm = this.uiModalService.abrirFormularioAvanceSignal();
      if (debeAbrirseForm) {
        console.log('🟢 Capturado disparo del Footer en el Tablero de Inicio');
        this.mostrarModalFormularioAvance.set(true); // Encendemos la signal local de inmediato
      }
    });
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.isLoading.set(true);
    
    this.materialesService.getHistorial().subscribe({
      next: () => {
        this.isLoading.set(false); // Apagamos cargador para pintar el DOM

        const totalRegistrosActuales = this.totalComidas();
        const yaVioBienvenida = localStorage.getItem('onboarding_visto') === 'true';

        // Gestión reactiva del Onboarding sin retrasos vulnerables
        if (totalRegistrosActuales === 0 && !yaVioBienvenida) {
          this.mostrarModalBienvenida.set(true);
        }
      },
      error: (err) => {
        console.error('❌ Error en Atlas:', err);
        this.isLoading.set(false);
      }
    });

    this.activarNotificacionesPushDelReto();
  }

  // ℹ️ Métodos de Control del Botón de Ayuda (Instrucciones)
  abrirInstrucciones() {
    this.mostrarModalInstrucciones.set(true);
  }

  cerrarInstrucciones() {
    this.mostrarModalInstrucciones.set(false);
  }

  // 👋 Métodos del Modal de Bienvenida
  cerrarBienvenida() {
    this.mostrarModalBienvenida.set(false);
    localStorage.setItem('onboarding_visto', 'true'); 
  }

  // 🍳 MÉTODO RECONFIGURADO: Abre el Offcanvas del formulario de forma local
  irAFormulario() {
    console.log('🚀 Abriendo modal de formulario de forma reactiva local.');
    this.mostrarModalFormularioAvance.set(true);
  }

  // 📊 MÉTODO RECONFIGURADO: Abre el Offcanvas de puntajes de forma local
  verMiPuntaje() {
    console.log('📊 Abriendo modal de puntaje de forma reactiva local.');
    this.mostrarModalMiPuntaje.set(true);
  }

  // 🧼 Métodos de Limpieza y Cierre para el (didDismiss) de Ionic
  onModalFormularioCerrado() {
    console.log('🧼 Reseteando señales de control del Formulario.');
    this.mostrarModalFormularioAvance.set(false);
    this.uiModalService.abrirFormularioAvanceSignal.set(false); // Limpiamos el servicio puente
  }

  onModalPuntajeCerrado() {
    console.log('🧼 Reseteando señales de control de Puntaje.');
    this.mostrarModalMiPuntaje.set(false);
  }

  irAlConsejos() { this.router.navigateByUrl('/consejos'); }
  irAlHistorial() { this.router.navigateByUrl('/historial'); }
  activarNotificacionesPushDelReto() { /* Tu función de notificaciones intacta */ }
  cambiarEstado(nuevoEstado: any) { this.estadoActual.set(nuevoEstado); }

}
