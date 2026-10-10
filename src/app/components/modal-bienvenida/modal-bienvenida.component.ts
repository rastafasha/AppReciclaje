import { CommonModule } from '@angular/common';
import { Component, input, OnInit, output } from '@angular/core';
import { IonModal, IonButton } from '@ionic/angular';

@Component({
  selector: 'app-modal-bienvenida',
  templateUrl: './modal-bienvenida.component.html',
  styleUrls: ['./modal-bienvenida.component.scss'],
  imports: [CommonModule, IonModal, IonButton]
})
export class ModalBienvenidaComponent   {
 // 🚦 Recibe el estado booleano de apertura desde el padre
  public isOpen = input<boolean>(false);
  public nombreUsuario = input<string>('Retador');

  // ⚡ Emite el evento de cierre hacia el padre
  public cerrar = output<void>();

  notificarCierre() {
    this.cerrar.emit();
  }

}
