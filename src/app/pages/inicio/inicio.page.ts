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
import { IonContent, IonIcon, IonModal, ToastController } from '@ionic/angular';
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
import { ConsejoService } from '../../services/consejo-service';
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
  public uiModalService = inject(UiModalService);
  public tipsService = inject(ConsejoService);

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

  // 1. Añade este Signal para recordar qué botón se presionó en el Home
  public comidaParaFormulario = signal<string | null>(null);

  public estadoActual = signal<any>('saludando');
  public estaAnimandose = signal<boolean>(false);

  // 🚀 COMPUTED  Extrae únicamente la última píldora en vivo
  public ultimoTipCreado = computed(() => {
    const todosLosTips = this.tipsService.tipsInApp();
    if (todosLosTips && todosLosTips.length > 0) {
      return todosLosTips[0]; // Como Atlas viene ordenado por -1, el índice 0 es el último creado
    }
    return {
      titulo: '💡 TIP ECOLÓGICO',
      descripcion: 'Mantén activa tu racha diaria en el campus UCC. Escanea tus depósitos de envases de Mercadona para sumar puntos de recompensa en la cartelera.'
    };
  });
// Sigue los estándares de Angular usando un computed en lugar de un getter tradicional
public comidasRegistradasHoy = computed<string[]>(() => {
  const registros = this.materialesService.historial?.() || [];
  
  // Capturamos la fecha de hoy respetando la zona horaria del usuario (Local)
  const hoyLocal = new Date();
  const año = hoyLocal.getFullYear();
  const mes = String(hoyLocal.getMonth() + 1).padStart(2, '0');
  const dia = String(hoyLocal.getDate()).padStart(2, '0');
  const hoyStr = `${año}-${mes}-${dia}`; // Resultado exacto: "2026-10-16"

  // Filtramos usando de forma unívoca el campo 'fechaString' de tu base de datos
  return registros
    .filter((reg: any) => reg.fechaString === hoyStr)
    .map((reg: any) => reg.comida.toUpperCase()); // Retorna ej: ['DESAYUNO', 'ALMUERZO']
});

  constructor() {
    addIcons({
      notificationsOutline, menuOutline, helpCircleOutline,
      pizza, restaurant, ribbon, refreshCircleOutline,
      documentTextOutline, personCircleOutline,
    });

  }

  ionViewWillEnter() {
    // Cada vez que el participante abra el Home, escaneamos si hay un comunicado nuevo flotando
    this.notificationService.checkUnreadNotificationsInApp();
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.isLoading.set(true);
    // Ejecuta la carga inicial de los tips para poblar el computed de inmediato
    this.tipsService.cargarConsejosDelConcurso();

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

  public animacionAleatoria() {
    // 2. Si ya está ejecutando una animación random, ignoramos el clic
    if (this.estaAnimandose()) return;

    const animaciones: ('saludando' | 'interactuando' | 'apuntando')[] = [
      'saludando',
      'interactuando',
      'apuntando'
    ];

    const indiceRandom = Math.floor(Math.random() * animaciones.length);
    const estadoSeleccionado = animaciones[indiceRandom];

    // 3. Bloqueamos el botón y cambiamos el estado
    this.estaAnimandose.set(true);
    this.estadoActual.set(estadoSeleccionado);

    // 4. Liberamos el bloqueo y regresamos a la normalidad tras 2.5 segundos
    setTimeout(() => {
      this.estadoActual.set('normal');
      this.estaAnimandose.set(false); // Listo para recibir otro clic
    }, 2500);
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



  // 3. Modifica tu método para recibir el parámetro de la comida
  irAFormulario(comidaElegida: string) {
    this.comidaParaFormulario.set(comidaElegida); // Guardamos la selección
    this.mostrarModalFormularioAvance.set(true);   // Abrimos el modal
  }

  onModalFormularioCerrado() {
    this.mostrarModalFormularioAvance.set(false);
    this.comidaParaFormulario.set(null); // 🧼 Limpiamos al cerrar
    this.uiModalService.resetearDisparador();
  }

  // 📊 MÉTODO RECONFIGURADO: Abre el Offcanvas de puntajes de forma local
  verMiPuntaje() {
    // console.log('📊 Abriendo modal de puntaje de forma reactiva local.');
    this.mostrarModalMiPuntaje.set(true);
  }



  onModalPuntajeCerrado() {
    this.mostrarModalMiPuntaje.set(false);
    this.uiModalService.resetearPuntaje(); // 🧼 Deja el servicio listo para otro clic
  }

  irAlConsejos() { this.router.navigateByUrl('/consejos'); }
  irAlHistorial() { this.router.navigateByUrl('/historial'); }
  activarNotificacionesPushDelReto() { /* Tu función de notificaciones intacta */ }
  cambiarEstado(nuevoEstado: any) { this.estadoActual.set(nuevoEstado); }

}
