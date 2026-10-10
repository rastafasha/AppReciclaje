import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { notificationsOutline, menuOutline, refreshCircleOutline, documentTextOutline, personCircleOutline } from 'ionicons/icons';
import { IonContent,  IonModal } from '@ionic/angular';
import { INotificacion } from '../../models/notificacion.model';
import { NotificacionDetalleComponent } from '../../components/notificacion-detalle/notificacion-detalle.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { NotificationService } from '../../services/notificacion-service';
import { BackbuttonComponent } from '../../shared/backbutton/backbutton.component';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, RouterModule, IonModal,
    NotificacionDetalleComponent, HeaderComponent,  BackbuttonComponent]
})
export class NotificacionesPage implements OnInit{
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  // ⚡ Referencia física para controlar por código la apertura del segundo Offcanvas deslizable
  @ViewChild('modalDetalleAlerta') modalDetalleAlerta!: IonModal;

  public isLoading = signal<boolean>(false);
  public alertasInApp = signal<INotificacion[]>([]); // 🚦 Comienza vacío hasta que responda Atlas

  // 🚦 Signal de notificaciones para poblar tu bucle dinámico
  // public alertasInApp = signal<INotificacion[]>([
  //   { id: '1', titulo: '¡Racha Iniciada! 🎉', mensaje: 'Registraste tu primer hábito. Completa 21 días para participar en el sorteo de Mercadona.', tipo: 'AVISO_GENERAL', leido: false, createdAt: '' },
  //   { id: '2', titulo: 'Consejo del Día 💡', mensaje: 'Usa las conchas de frutas para abonar tus plantas de forma natural.', tipo: 'LOGRO_DESBLOQUEADO', leido: false, createdAt: '' }
  // ]);

  // 🚦 Signal de almacenamiento para congelar la notificación seleccionada y pasársela al hijo
  public alertaSeleccionada = signal<INotificacion>({
    id: '', titulo: '', mensaje: '', tipo: 'AVISO_GENERAL', leido: false, createdAt: ''
  });

  constructor() {
    addIcons({ notificationsOutline, menuOutline, refreshCircleOutline, documentTextOutline, personCircleOutline });
  }

  ngOnInit() {
    this.listarNotificaciones();
  }

  /**
   * 📋 Consume tu controlador GET /api/notificaciones/pendientes
   */
  listarNotificaciones() {
    this.isLoading.set(true);
    this.notificationService.getNotificacionesPendientes().subscribe({
      next: (resp: any) => {
        if (resp.ok && resp.alertas) {
          // Asignamos las alertas reales de la base de datos a la señal del @for
          this.alertasInApp.set(resp.alertas);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('❌ Error al recuperar alertas pendientes:', err);
        this.isLoading.set(false);
      }
    });
  }

  /**ß
   * 🚀 FUNCIÓN MAESTRA: Captura el registro clickeado en tu lista del Figma y activa el Offcanvas de detalle
   */
 abrirDetalle(alerta: INotificacion) {
    this.alertaSeleccionada.set(alerta);
    this.modalDetalleAlerta.present();

    if (alerta.id && !alerta.leido) {
      // Consumimos tu endpoint PUT /api/notificaciones/marcar-leida/:id
      this.notificationService.marcarComoLeida(alerta.id).subscribe({
        next: () => {
          console.log(`🧹 Alerta ${alerta.id} marcada como leída.`);
          this.listarNotificaciones(); // Recargamos la lista en caliente para restar el contador
        }
      });
    }
  }

  

  marcarTodasComoLeidas() {
    console.log('🧹 Limpiando globos de notificaciones mediante HTTP PUT /api/notificaciones/marcar-leida');
  }

  irAlInicio() { this.router.navigateByUrl('/inicio'); }
  irAConsejos() { this.router.navigateByUrl('/consejos'); }
  irAlPerfil() { this.router.navigateByUrl('/mi-cuenta'); }
}
