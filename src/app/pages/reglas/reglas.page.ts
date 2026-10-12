import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { notificationsOutline, menuOutline, refreshCircleOutline, documentTextOutline, personCircleOutline } from 'ionicons/icons';
import { IonContent, ModalController, IonSpinner } from '@ionic/angular';
import { HeaderComponent } from '../../shared/header/header.component';
import { MenufooterComponent } from '../../shared/menufooter/menufooter.component';
import { BackbuttonComponent } from '../../shared/backbutton/backbutton.component';
import { AuthService } from '../../services/auth';
import { HojaAnimadaComponent } from '../../components/hoja-animada/hoja-animada.component';
import { ReglasService } from '../../services/reglas-service';

@Component({
  selector: 'app-reglas',
  templateUrl: './reglas.page.html',
  styleUrls: ['./reglas.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, HeaderComponent, MenufooterComponent, BackbuttonComponent, HojaAnimadaComponent, IonSpinner]
})
export class ReglasPage implements OnInit{
  private authService = inject(AuthService);
  public reglasService = inject(ReglasService);

  public estadoActual = signal<any>('saludando');

  public nombreUsuario = computed(() => {
    const user = this.authService.usuarioActual();
    if (user) {
      return user.profile?.first_name || user.username || 'Usuario';
    }
    const tokenToken = localStorage.getItem('token');
    if (tokenToken) {
      return 'Retador'; 
    }
    return 'Usuario';
  });

  constructor() {
    addIcons({ notificationsOutline, menuOutline, refreshCircleOutline, documentTextOutline, personCircleOutline });
  }

  // 🚀 Disparamos la carga de datos al inicializar la vista en el smartphone
  ngOnInit() {
    if (!this.reglasService.reglas()) {
      this.reglasService.obtenerReglas();
    }
  }

}
