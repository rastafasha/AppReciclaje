import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { notificationsOutline, menuOutline } from 'ionicons/icons';
import { IonButton, IonContent, } from '@ionic/angular';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-bienvenida',
  templateUrl: './bienvenida.page.html',
  styleUrls: ['./bienvenida.page.scss'],
  standalone: true,
  imports: [CommonModule,  IonContent, IonButton,  RouterModule, HeaderComponent]
})
export class BienvenidaPage {
  private router = inject(Router);

  constructor() {
    // Registramos los iconos nativos de Ionicons que se muestran en la barra superior
    addIcons({ notificationsOutline, menuOutline });
  }

  irACompletarPerfil() {
    this.router.navigateByUrl('/perfil-editar');
  }

  irANotificaciones() {
    this.router.navigateByUrl('/historial');
  }
}
