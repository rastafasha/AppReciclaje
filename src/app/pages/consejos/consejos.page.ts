import { Component, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { notificationsOutline, menuOutline, refreshCircleOutline, documentTextOutline, personCircleOutline } from 'ionicons/icons';
import { IonContent,  IonModal } from '@ionic/angular';
import { IConsejoData, DetalleConsejoComponent } from '../../components/consejo-detalle/consejo-detalle.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { MenufooterComponent } from '../../shared/menufooter/menufooter.component';
import { BackbuttonComponent } from '../../shared/backbutton/backbutton.component';

@Component({
  selector: 'app-consejos',
  templateUrl: './consejos.page.html',
  styleUrls: ['./consejos.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, RouterModule, IonModal, DetalleConsejoComponent, HeaderComponent, MenufooterComponent, BackbuttonComponent]
})
export class ConsejosPage {
  private router = inject(Router);
  @ViewChild('modalDetalle') modalDetalle!: IonModal;

  // 🚦 Signal para almacenar el consejo activo seleccionado en la lista
  public consejoSeleccionado = signal<IConsejoData>({ titulo: '', contenido: '' });

// Lista mockeada idéntica a tus bloques del Figma
  public listaConsejos: IConsejoData[] = [
    { titulo: 'Aprovechamiento de Verduras', contenido: 'Utiliza las cáscaras de zanahoria y papas para crear caldos vegetales nutritivos antes de desecharlas en el contenedor orgánico.' },
    { titulo: 'Compostaje en Casa', contenido: 'Las conchas de plátano y restos de café son excelentes aceleradores de nitrógeno para tus plantas. ¡Sepáralas diariamente!' },
    { titulo: 'Planificación de Porciones', contenido: 'Medir las porciones de carbohidratos reduce los sobrantes de comida en la cena, promoviendo un consumo responsable y saludable.' }
  ];
  constructor() {
    addIcons({ notificationsOutline, menuOutline, refreshCircleOutline, documentTextOutline, personCircleOutline });
  }

  abrirDetalle(consejo: IConsejoData) {
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
