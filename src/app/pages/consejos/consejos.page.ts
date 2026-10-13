import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { notificationsOutline, menuOutline, refreshCircleOutline, documentTextOutline, personCircleOutline, arrowForwardOutline } from 'ionicons/icons';
import { IonContent, IonModal, IonIcon, IonSpinner } from '@ionic/angular';
import { IConsejoData, DetalleConsejoComponent } from '../../components/consejo-detalle/consejo-detalle.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { BackbuttonComponent } from '../../shared/backbutton/backbutton.component';
import { HojaAnimadaComponent } from '../../components/hoja-animada/hoja-animada.component';
import { ConsejoService } from '../../services/consejo-service';
import { ITipEcologico } from '../../models/tip-ecologico.model';

@Component({
  selector: 'app-consejos',
  templateUrl: './consejos.page.html',
  styleUrls: ['./consejos.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, RouterModule, IonModal, DetalleConsejoComponent, HeaderComponent, BackbuttonComponent, HojaAnimadaComponent, IonIcon, IonSpinner]
})
export class ConsejosPage implements OnInit{
  private router = inject(Router);
  public tipsService = inject(ConsejoService);

  @ViewChild('modalDetalle') modalDetalle!: IonModal;
  
  public estadoActual = signal<any>('saludando');
  // 🚦 Signal para almacenar el consejo activo seleccionado en la lista
  public consejoSeleccionado = signal<ITipEcologico>({ 
  titulo: '', 
  descripcion: '', 
  activo: true 
});
  

 
  constructor() {
    addIcons({ notificationsOutline, menuOutline, 
      refreshCircleOutline, documentTextOutline, personCircleOutline, arrowForwardOutline });
  }
  ngOnInit() {
    // Carga inicial reglamentaria al instanciar el componente
    this.tipsService.cargarConsejosDelConcurso();
  }

  /**
   * 📲 CICLO DE VIDA NATIVO DE IONIC:
   * Re-sincroniza las píldoras desde Atlas en segundo plano cada vez que el usuario
   * entre a la pantalla, atrapando cualquier tip nuevo que guarde el administrador.
   */
  ionViewWillEnter() {
    console.log('📡 [PWA CONSEJOS]: Sincronizando cartelera diaria con MongoDB Atlas...');
    this.tipsService.cargarConsejosDelConcurso();
  }

  /**
   * 🔄 Método para que el participante pueda refrescar manualmente la lista con un botón
   */
  forzarRefresco() {
    this.tipsService.cargarConsejosDelConcurso();
  }

 

  abrirDetalle(consejo: ITipEcologico) {
    this.consejoSeleccionado.set(consejo); // Actualizamos la signal con la fila elegida
    this.modalDetalle.present(); // Desplegamos el Offcanvas manualmente
  }

  irAlInicio() {
    this.router.navigateByUrl('/inicio');
  }

  irAlPerfil() {
    this.router.navigateByUrl('/perfil-editar');
  }
}
