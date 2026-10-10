import { Component, inject, input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonIcon } from '@ionic/angular';

@Component({
  selector: 'app-menufooter',
  templateUrl: './menufooter.component.html',
  styleUrls: ['./menufooter.component.scss'],
  imports: [IonIcon],
})
export class MenufooterComponent  {

  private router = inject(Router);

  public tabActiva = input<string>('inicio');

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
