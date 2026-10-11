import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiModalService {
  // 🚦 Signal global que avisa si alguien presionó el botón central del footer
  public abrirFormularioAvanceSignal = signal<boolean>(false);

  dispararFormulario() {
    this.abrirFormularioAvanceSignal.set(true);
  }

  resetearDisparador() {
    this.abrirFormularioAvanceSignal.set(false);
  }
}
