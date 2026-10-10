import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  notificationsOutline, menuOutline, helpCircleOutline, 
  pizza, restaurant, ribbon, refreshCircleOutline, 
  documentTextOutline, personCircleOutline 
} from 'ionicons/icons';
import { IonContent,  IonButton, IonIcon, IonModal } from '@ionic/angular';
import { MiPuntajeComponent } from '../../components/mi-puntaje/mi-puntaje.component';
import { FormularioAvanceComponent } from '../../components/formulario-avance/formulario-avance.component';
import { MaterialesService } from '../../services/materiales';
import { HeaderComponent } from '../../shared/header/header.component';
import { MenufooterComponent } from '../../shared/menufooter/menufooter.component';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent,
    IonButton, IonIcon, RouterModule,
    FormularioAvanceComponent, MiPuntajeComponent, IonModal,
    HeaderComponent, MenufooterComponent]
})
export class InicioPage implements OnInit{
  private router = inject(Router);
  private materialesService = inject(MaterialesService);

  // Enlazamos las signals computadas para el HTML
  public rango = this.materialesService.rangoActual;
  public totalComidas = this.materialesService.totalRegistros;

  @ViewChild('modalAvance') modalAvance!: IonModal;
  @ViewChild('modalPuntaje') modalPuntaje!: IonModal;

  constructor() {
    // Registramos la colección completa de íconos del Figma y las Tabs
    addIcons({ 
      notificationsOutline, menuOutline, helpCircleOutline, 
      pizza, restaurant, ribbon, refreshCircleOutline, 
      documentTextOutline, personCircleOutline 
    });
  }

  ngOnInit() {
    // ⚡ Al entrar al inicio, mandamos a pedir la data real para que calcule las medallas de inmediato
    this.materialesService.getHistorial().subscribe();
  }

  irAFormulario() {
    this.router.navigateByUrl('/formulario-avance');
  }

  verMiPuntaje() {
    this.router.navigateByUrl('/mi-puntaje');
  }

  irAlConsejos() {
    this.router.navigateByUrl('/consejos');
  }

  
  irAlHistorial() {
    this.router.navigateByUrl('/historial');
  }

  

   irAHistorial() {
  this.router.navigateByUrl('/historial');
}
}
