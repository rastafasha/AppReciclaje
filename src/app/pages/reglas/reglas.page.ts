import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { notificationsOutline, menuOutline, refreshCircleOutline, documentTextOutline, personCircleOutline } from 'ionicons/icons';
import { IonContent} from '@ionic/angular';
import { HeaderComponent } from '../../shared/header/header.component';
import { MenufooterComponent } from '../../shared/menufooter/menufooter.component';

@Component({
  selector: 'app-reglas',
  templateUrl: './reglas.page.html',
  styleUrls: ['./reglas.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, HeaderComponent, MenufooterComponent]
})
export class ReglasPage {
  private router = inject(Router);

  constructor() {
    addIcons({ notificationsOutline, menuOutline, refreshCircleOutline, documentTextOutline, personCircleOutline });
  }

  irANotificaciones() {
    this.router.navigateByUrl('/notificaciones');
  }

  irAlInicio() {
    this.router.navigateByUrl('/inicio');
  }

  irAConsejos() {
    this.router.navigateByUrl('/consejos');
  }
  irAReglas() {
    this.router.navigateByUrl('/reglas');
  }

  irAlPerfil() {
    this.router.navigateByUrl('/perfil-editar');
  }
}
