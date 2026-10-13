import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonSpinner, IonTitle, IonToolbar } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { HojaAnimadaComponent } from '../../components/hoja-animada/hoja-animada.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { MenufooterComponent } from '../../shared/menufooter/menufooter.component';
import { TerminosService } from '../../services/terminos-service';

@Component({
  selector: 'app-terminosycondiciones',
  templateUrl: './terminosycondiciones.page.html',
  styleUrls: ['./terminosycondiciones.page.scss'],
  imports: [CommonModule, IonContent, HeaderComponent, MenufooterComponent, 
    HojaAnimadaComponent, IonSpinner]
})
export class TerminosycondicionesPage implements OnInit {

 private router = inject(Router);
  private authService = inject(AuthService);
  public terminosService = inject(TerminosService); 

  // Signal simulado en caliente (puedes conectarlo a un servicio idéntico al de reglas)
  public terminosData = signal<any>

  public nombreUsuario = computed(() => {
    const user = this.authService.usuarioActual();
    if (user) {
      return user.profile?.first_name || user.username || 'Usuario';
    }
    return localStorage.getItem('token') ? 'Retador' : 'Usuario';
  });

  ngOnInit() {
    // Aquí puedes disparar la carga desde tu backend si lo deseas
    if (!this.terminosService.terminos()) {
      this.terminosService.obtenerTerminos();
    }
  }

}
