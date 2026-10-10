import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  notificationsOutline, menuOutline, close, person, 
  pencil, createOutline, powerOutline, refreshCircleOutline, 
  documentTextOutline, personCircleOutline 
} from 'ionicons/icons';
import { IonContent, IonIcon, IonToggle, IonButton, IonModal } from '@ionic/angular';
import { AgregarFamiliarComponent } from '../../components/agregar-familiar/agregar-familiar.component';
import { MenufooterComponent } from '../../shared/menufooter/menufooter.component';
import { HeaderComponent } from '../../shared/header/header.component';


@Component({
  selector: 'app-mi-cuenta',
  templateUrl: './mi-cuenta.page.html',
  styleUrls: ['./mi-cuenta.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, 
    IonIcon, IonToggle, IonButton,
    AgregarFamiliarComponent, IonModal, MenufooterComponent, HeaderComponent]
})
export class MiCuentaPage {
  private router = inject(Router);
  @ViewChild(IonModal) modal!: IonModal;

  constructor() {
    addIcons({ 
      notificationsOutline, menuOutline, close, person, 
      pencil, createOutline, powerOutline, refreshCircleOutline, 
      documentTextOutline, personCircleOutline 
    });
  }

  irANotificaciones() {
    this.router.navigateByUrl('/notificaciones');
  }

  irAEditarPerfil() {
    this.router.navigateByUrl('/perfil-editar');
  }

  cerrarSesion() {
    console.log('🚪 Destruyendo x-token local y limpiando estados reactivos');
    this.router.navigateByUrl('/login');
  }

  irAlInicio() {
    this.router.navigateByUrl('/inicio');
  }

  irAConsejos() {
    this.router.navigateByUrl('/consejos');
  }
}
