import { Component, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { notificationsOutline, menuOutline, refreshCircleOutline, documentTextOutline, personCircleOutline } from 'ionicons/icons';
import { IonContent,  IonModal } from '@ionic/angular';
import { INotificacion } from '../../models/notificacion.model';
import { NotificacionDetalleComponent } from '../../components/notificacion-detalle/notificacion-detalle.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { MenufooterComponent } from '../../shared/menufooter/menufooter.component';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, RouterModule, IonModal,
    NotificacionDetalleComponent, HeaderComponent, MenufooterComponent]
})
export class NotificacionesPage {
  private router = inject(Router);

  // ⚡ Referencia física para controlar por código la apertura del segundo Offcanvas deslizable
  @ViewChild('modalDetalleAlerta') modalDetalleAlerta!: IonModal;

  public isLoading = signal<boolean>(false);

  // 🚦 Signal de notificaciones para poblar tu bucle dinámico
  public alertasInApp = signal<INotificacion[]>([
    { id: '1', titulo: '¡Racha Iniciada! 🎉', mensaje: 'Registraste tu primer hábito. Completa 21 días para participar en el sorteo de Mercadona.', tipo: 'AVISO_GENERAL', leido: false, createdAt: '' },
    { id: '2', titulo: 'Consejo del Día 💡', mensaje: 'Usa las conchas de frutas para abonar tus plantas de forma natural.', tipo: 'LOGRO_DESBLOQUEADO', leido: false, createdAt: '' }
  ]);

  // 🚦 Signal de almacenamiento para congelar la notificación seleccionada y pasársela al hijo
  public alertaSeleccionada = signal<INotificacion>({
    id: '', titulo: '', mensaje: '', tipo: 'AVISO_GENERAL', leido: false, createdAt: ''
  });

  constructor() {
    addIcons({ notificationsOutline, menuOutline, refreshCircleOutline, documentTextOutline, personCircleOutline });
  }

  /**ß
   * 🚀 FUNCIÓN MAESTRA: Captura el registro clickeado en tu lista del Figma y activa el Offcanvas de detalle
   */
  abrirDetalle(alerta: INotificacion) {
    this.alertaSeleccionada.set(alerta);
    this.modalDetalleAlerta.present(); // Levanta la hoja superpuesta desde el fondo de la pantalla
  }

  listarNotificaciones(){
    this.isLoading.set(true);
    this.isLoading.set(false);
  }

  marcarTodasComoLeidas() {
    console.log('🧹 Limpiando globos de notificaciones mediante HTTP PUT /api/notificaciones/marcar-leida');
  }

  irAlInicio() { this.router.navigateByUrl('/inicio'); }
  irAConsejos() { this.router.navigateByUrl('/consejos'); }
  irAlPerfil() { this.router.navigateByUrl('/mi-cuenta'); }
}
