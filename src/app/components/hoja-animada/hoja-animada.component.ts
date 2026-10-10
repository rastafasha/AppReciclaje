import { CommonModule } from '@angular/common';
import { Component, computed, input, OnInit } from '@angular/core';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

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
  public opcionesLottie = computed<AnimationOptions>(() => {
    let pathJson = 'assets/animations/personaje_capas.json'; // Estado: normal

    if (this.estado() === 'saludando') {
      pathJson = 'assets/animations/personaje_saludo.json';
    } else if (this.estado() === 'interactuando') {
      pathJson = 'assets/animations/personaje_interactuando.json'; // O el nombre real de tu JSON
    } else if (this.estado() === 'apuntando') {
      pathJson = 'assets/animations/personaje_apuntando.json';
    }

    return {
      path: pathJson,
      autoplay: true,
      // Si está saludando, forzamos loop false basado en tu regla, de lo contrario lee el input
      loop: this.estado() === 'saludando' ? false : this.loop()
    };
  });

}
