import { CommonModule } from '@angular/common';
import { Component, input, OnInit, output } from '@angular/core';
import { IonModal, IonButton } from '@ionic/angular';

@Component({
  selector: 'app-modal-instrucciones',
  templateUrl: './modal-instrucciones.component.html',
  styleUrls: ['./modal-instrucciones.component.scss'],
  imports: [CommonModule, IonModal, IonButton]
})
export class ModalInstruccionesComponent {

  // 🚦 Recibe el estado booleano de apertura desde el padre
  public isOpen = input<boolean>(false);

  // ⚡ Emite el evento de cierre hacia el padre
  public cerrar = output<void>();

  notificarCierre() {
    this.cerrar.emit();
  }

}
