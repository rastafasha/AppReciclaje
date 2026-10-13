import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { notificationsOutline, menuOutline, refreshCircleOutline, documentTextOutline, personCircleOutline, checkmarkDoneOutline, eyeOutline } from 'ionicons/icons';
// 🚀 INYECTAMOS IonInfiniteScroll EN LA CAPTURA FÍSICA
import { IonContent, IonModal, IonIcon, IonSegment, IonSegmentButton, IonLabel, IonSpinner, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular';
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
  imports: [
    CommonModule, IonContent, RouterModule, IonModal, IonIcon,
    IonSegment, IonSegmentButton, IonLabel, IonSpinner, IonInfiniteScroll, IonInfiniteScrollContent,
    NotificacionDetalleComponent, HeaderComponent, BackbuttonComponent, HojaAnimadaComponent
  ]
})
export class NotificacionesPage implements OnInit {
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  @ViewChild('modalDetalleAlerta') modalDetalleAlerta!: IonModal;
  
  // 🎯 CAPTURAMOS EL COMPONENTE DE INFINITE SCROLL POR CÓDIGO
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  public estadoActual = signal<any>('saludando');
  public isLoading = signal<boolean>(false);
  public tabActiva = signal<'pendientes' | 'leidas'>('pendientes');

  public alertasInApp = signal<INotificacion[]>([]); 
  public historialLeidas = signal<INotificacion[]>([]);
  public totalLeidas = signal<number>(0);

  public desdeLeidas = signal<number>(0);
  private LIMITE_PAGINA = 4; // Tu valor de pruebas (tienes 12 registros)

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
    this.listarNotificacionesPendientes();
    this.notificationService.actualizarContadorBackend();
  }

  /**
   * 📲 INTERCEPTOR DE HARDWARE EN CALIENTE DE IONIC
   * Se ejecuta cada vez que el retador entra a la vista de alertas
   */
  ionViewWillEnter() {
    // 🕵️‍♂️ Inspeccionamos si el participante viene rebotado de pulsar "Ver" en un Toast
    const alertaEnEspera = this.notificationService.alertaPendientePorAbrir();

    if (alertaEnEspera) {
      console.log('🚀 [REDIRECCIÓN TOAST]: Detectada alerta en cola. Levantando Offcanvas nativo...');
      
      // 1. Limpiamos la variable del servicio inmediatamente para que no se repita el bucle al volver a entrar
      this.notificationService.alertaPendientePorAbrir.set(null);

      // 2. Encendemos de forma automática la pestaña de pendientes si por alguna razón no estaba ahí
      this.tabActiva.set('pendientes');

      // 3. 🎯 Disparamos tu función maestra original con todos sus efectos reactivos
      // Esto abrirá el modal inferior, mutará el array visual y descontará el Header en Atlas.
      setTimeout(() => {
        this.abrirDetalle(alertaEnEspera); //
      }, 300); // 300ms de cortesía para que Ionic termine la animación de transición de la página
    }
  }

  cambiarTab(event: any) {
    const proximaTab = event.detail.value;
    this.tabActiva.set(proximaTab);
    
    if (proximaTab === 'leidas') {
      // 🚀 Desbloqueamos el scroll manualmente al entrar al historial
      if (this.infiniteScroll) this.infiniteScroll.disabled = false;

      if (this.historialLeidas().length === 0) {
        this.desdeLeidas.set(0);
        this.listarHistorialLeidas();
      }
    } else {
      // 🚀 Si vuelve a pendientes, congelamos el scroll para que no tire peticiones fantasmas
      if (this.infiniteScroll) this.infiniteScroll.disabled = true;
      this.listarNotificacionesPendientes();
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
      error: () => this.isLoading.set(false)
    });
  }

  listarHistorialLeidas() {
    this.isLoading.set(true);
    this.notificationService.getNotificacionesLeidas(this.desdeLeidas()).subscribe({
      next: (resp: any) => {
        if (resp.ok && resp.alertas) {
          this.historialLeidas.set(resp.alertas);
          this.totalLeidas.set(resp.total || 0);

          // Si desde la primera carga ya trajimos todo el universo de datos, apagamos
          if (resp.alertas.length >= (resp.total || 0) && this.infiniteScroll) {
            this.infiniteScroll.disabled = true;
          }
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  cargarSiguientePaginaLeidas(event: any) {
    // 🛡️ Filtro de seguridad por si acaso se cuela un evento en la tab errónea
    if (this.tabActiva() !== 'leidas') {
      event.target.complete();
      return;
    }

    const saltoReal = this.historialLeidas().length;
    this.desdeLeidas.set(saltoReal);

    console.log(`📡 Disparado por Hardware. Extrayendo desde: ${saltoReal}`);

    this.notificationService.getNotificacionesLeidas(this.desdeLeidas()).subscribe({
      next: (resp: any) => {
        if (resp.ok && resp.alertas) {
          this.historialLeidas.update((actuales) => [...actuales, ...resp.alertas]);
        }
        
        event.target.complete();

        // Si ya vaciaste el saco de la base de datos de Atlas, cerramos la tubería
        if (this.historialLeidas().length >= this.totalLeidas()) {
          event.target.disabled = true;
          console.log('🔒 Fin de Atlas alcanzado. Infinite Scroll apagado.');
        }
      },
      error: () => event.target.complete()
    });
  }

  abrirDetalle(alerta: INotificacion) {
    const idReal = alerta._id;
    const alertaActualizada = { ...alerta, leido: true };
    this.alertaSeleccionada.set(alertaActualizada);
    this.modalDetalleAlerta.present();

    if (idReal && !alerta.leido) {
      this.alertasInApp.update((actuales) => actuales.filter(item => item._id !== idReal));
      this.notificationService.marcarComoLeida(idReal).subscribe({
        next: () => {
          this.historialLeidas.update((viejas) => [alertaActualizada, ...viejas]);
        }
      });
    }
  }

  marcarTodasComoLeidas() {
    this.isLoading.set(true);
    this.notificationService.marcarComoLeidaTodas().subscribe({
      next: (resp) => {
        if (resp.ok) {
          const convertidas = this.alertasInApp().map(a => ({ ...a, leido: true }));
          this.historialLeidas.update((viejas) => [...convertidas, ...viejas]);
          this.alertasInApp.set([]);
          this.isLoading.set(false);
        }
      },
      error: () => this.isLoading.set(false)
    });
  }
}