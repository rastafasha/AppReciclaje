import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root' // 🚀 CRÍTICO: Asegura una ÚNICA instancia compartida en toda la PWA
})
export class UiModalService {
  // Signals globales de estado de apertura
  public abrirFormularioAvanceSignal = signal<boolean>(false);
  public abrirPuntajeSignal = signal<boolean>(false);

  /**
   * 🟢 Gatilla la apertura del Formulario de Avance desde cualquier componente
   */
  dispararFormulario() {
    console.log('📡 [UI SERVICE] -> Disparando Formulario de Avance...');
    this.abrirFormularioAvanceSignal.set(true);
  }

  /**
   * 📊 Gatilla la apertura del panel de Mi Puntaje
   */
  dispararPuntaje() {
    console.log('📡 [UI SERVICE] -> Disparando Vista de Puntaje...');
    this.abrirPuntajeSignal.set(true);
  }

  /**
   * 🧼 Resetea los estados de control
   */
  resetearDisparador() {
    this.abrirFormularioAvanceSignal.set(false);
  }

  resetearPuntaje() {
    this.abrirPuntajeSignal.set(false);
  }


 
}
