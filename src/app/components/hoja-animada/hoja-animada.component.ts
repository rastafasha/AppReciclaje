import { CommonModule } from '@angular/common';
import { Component, computed, input, OnInit } from '@angular/core';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web'; // 🚀 Importante importar este tipo


// 🏷️ Mapeamos de forma estricta los 4 estados de tu archivo previo
export type EstadoHojita = 'normal' | 'saludando' | 'interactuando' | 'apuntando';


@Component({
  selector: 'app-hoja-animada',

  templateUrl: './hoja-animada.component.html',
  styleUrls: ['./hoja-animada.component.scss'],
  standalone: true,
  imports: [CommonModule, LottieComponent]
})
export class HojaAnimadaComponent  {

  // 🚦 Inputs modernos de Angular 22 para controlar el tamaño desde el padre
  public ancho = input<number>(180); 
  public loop = input<boolean>(true);
  
  // 🚀 El padre le pasa el estado inicial (por defecto 'normal')
  public estado = input<EstadoHojita>('normal');

  // 🚦 Signal Computado: Escucha los inputs y arma el objeto dinámicamente
  // Corregimos las rutas quitando el punto inicial para asegurar compatibilidad con la PWA
  // 📦 Guardamos la referencia interna de la animación de Lottie
  private lottieInstance: AnimationItem | null = null;

  // Escucha el evento cuando el Lottie interno es creado por ngx-lottie
  public onAnimate(animationItem: AnimationItem): void {
    this.lottieInstance = animationItem;
  }

  public opcionesLottie = computed<AnimationOptions>(() => {
    let pathJson = 'assets/animations/personaje_capas.json';

    if (this.estado() === 'saludando') {
      pathJson = 'assets/animations/personaje_saludo.json';
    } else if (this.estado() === 'interactuando') {
      pathJson = 'assets/animations/personaje_capas.json';
    } else if (this.estado() === 'apuntando') {
      pathJson = 'assets/animations/personaje_apuntando.json';
    }

    

    // 🔄 Si ya existe una instancia corriendo, detenemos la animación previa 
    // bruscamente justo antes de cambiar el path para evitar fotogramas fantasma
    if (this.lottieInstance) {
      this.lottieInstance.stop();
    }

    return {
      path: pathJson,
      autoplay: true,
      loop: this.estado() === 'saludando' ? false : this.loop()
    };
  });

}
