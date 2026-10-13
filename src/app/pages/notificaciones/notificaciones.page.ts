import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { notificationsOutline, menuOutline, refreshCircleOutline, documentTextOutline, personCircleOutline, checkmarkDoneOutline, eyeOutline } from 'ionicons/icons';
import { IonContent, IonModal, IonIcon, IonSegment, IonSegmentButton, IonLabel, IonSpinner } from '@ionic/angular';
import { INotificacion } from '../../models/notificacion.model';
import { NotificacionDetalleComponent } from '../../components/notificacion-detalle/notificacion-detalle.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { NotificationService } from '../../services/notificacion-service';
import { BackbuttonComponent } from '../../shared/backbutton/backbutton.component';
import { HojaAnimadaComponent } from '../../components/hoja-animada/hoja-animada.component';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, RouterModule, IonModal,
    NotificacionDetalleComponent, HeaderComponent, BackbuttonComponent, IonIcon, HojaAnimadaComponent, IonSegment, IonSegmentButton, IonLabel, IonSpinner]
})
export class NotificacionesPage implements OnInit {
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  // ⚡ Referencia física para controlar por código la apertura del segundo Offcanvas deslizable
  @ViewChild('modalDetalleAlerta') modalDetalleAlerta!: IonModal;
  public estadoActual = signal<any>('saludando');
  public isLoading = signal<boolean>(false);

   // 🚦 TABS CONTROL: Controla cuál vista de Atlas se renderiza en la PWA
  public tabActiva = signal<'pendientes' | 'leidas'>('pendientes');

  // 🗄️ REPOSITORIOS DE DATOS SEPARADOS
  public alertasInApp = signal<INotificacion[]>([]); 
  public historialLeidas = signal<INotificacion[]>([]);
  public totalLeidas = signal<number>(0);
  public desdeLeidas = 0; // Puntero para scroll posterior

  public alertaSeleccionada = signal<INotificacion>({
    _id: '', titulo: '', mensaje: '', tipo: 'AVISO_GENERAL', leido: false, createdAt: ''
  });

 

   constructor() {
    addIcons({
      notificationsOutline, menuOutline, refreshCircleOutline, 
      documentTextOutline, personCircleOutline, checkmarkDoneOutline, eyeOutline
    });
  }

  ngOnInit() {
    this.cargarDatosSegunTab();
    // this.listarNotificaciones();
    // 🌟 Sincroniza el contador del header al entrar a la bandeja
    this.notificationService.actualizarContadorBackend();
  }

  /**
   * 🎛️ Detecta el click del usuario en el selector de pestañas
   */
  cambiarTab(event: any) {
    this.tabActiva.set(event.detail.value);
    this.cargarDatosSegunTab();
  }

  cargarDatosSegunTab() {
    if (this.tabActiva() === 'pendientes') {
      this.listarNotificacionesPendientes();
    } else {
      this.listarHistorialLeidas();
    }
  }

  listarNotificacionesPendientes() {
    this.isLoading.set(true);
    this.notificationService.getNotificacionesPendientes().subscribe({
      next: (resp: any) => {
        if (resp.ok && resp.alertas) {
          this.alertasInApp.set(resp.alertas);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('❌ Error al recuperar pendientes:', err);
        this.isLoading.set(false);
      }
    });
  }

  listarHistorialLeidas() {
    this.isLoading.set(true);
    this.notificationService.getNotificacionesLeidas(this.desdeLeidas).subscribe({
      next: (resp: any) => {
        if (resp.ok && resp.alertas) {
          this.historialLeidas.set(resp.alertas);
          this.totalLeidas.set(resp.total || 0);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('❌ Error al recuperar historial de leídas:', err);
        this.isLoading.set(false);
      }
    });
  }

  



  abrirDetalle(alerta: INotificacion) {
    const idReal = alerta._id;
    const alertaActualizada = { ...alerta, leido: true };
    this.alertaSeleccionada.set(alertaActualizada);
    this.modalDetalleAlerta.present();

    if (idReal && !alerta.leido) {
      // Optimizamos en caliente quitándolo visualmente de pendientes
      this.alertasInApp.update((actuales) => actuales.filter(item => item._id !== idReal));

      this.notificationService.marcarComoLeida(idReal).subscribe({
        next: () => {
          // Si lo leyó desde la pestaña pendientes, lo agregamos al pool de leídas en RAM
          this.historialLeidas.update((viejas) => [alertaActualizada, ...viejas]);
        },
        error: (err) => {
          console.error('❌ Error al marcar leída:', err);
          this.listarNotificacionesPendientes(); // Fallback de re-sincronización
        }
      });
    }
  }


  marcarTodasComoLeidas() {
    this.isLoading.set(true);
    this.notificationService.marcarComoLeidaTodas().subscribe({
      next: (resp) => {
        if (resp.ok) {
          console.log('🧹 Bandeja vaciada de forma masiva en Atlas.');
          // Movemos todo al historial localmente para evitar peticiones extras
          const convertidas = this.alertasInApp().map(a => ({ ...a, leido: true }));
          this.historialLeidas.update((viejas) => [...convertidas, ...viejas]);
          this.alertasInApp.set([]);
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }
}
