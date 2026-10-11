import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, homeOutline, personOutline, trophyOutline } from 'ionicons/icons';
import { UiModalService } from '../../services/ui-modal-service';

@Component({
  selector: 'app-menufooter',
  templateUrl: './menufooter.component.html',
  styleUrls: ['./menufooter.component.scss'],
  imports: [CommonModule, RouterModule, IonIcon],
})
export class MenufooterComponent  {

  private router = inject(Router);
  private uiModalService = inject(UiModalService);

  public tabActiva = input<string>('inicio');
  constructor(){
    addIcons({ homeOutline, add, trophyOutline, personOutline });
  }

  abrirFormularioAvance() {
    console.log('🟢 Botón central pulsado. Notificando al servicio de UI...');
    this.uiModalService.dispararFormulario();
  }

  irAInicio() {
    this.router.navigateByUrl('/inicio');
  }
  irAReglas() {
    this.router.navigateByUrl('/reglas');
  }

  irAlPerfil() {
    this.router.navigateByUrl('/mi-cuenta');
  }

}
