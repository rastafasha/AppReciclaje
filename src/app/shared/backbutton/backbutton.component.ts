import { Component, inject, Input, OnInit } from '@angular/core';
import {  Location } from '@angular/common';
import { addIcons } from 'ionicons';
import { chevronBackOutline } from 'ionicons/icons';
import { IonIcon } from '@ionic/angular';
@Component({
  selector: 'app-backbutton',
  templateUrl: './backbutton.component.html',
  styleUrls: ['./backbutton.component.scss'],
  imports: [IonIcon],
})
export class BackbuttonComponent  {
  private location = inject(Location);
  @Input() pageTitle!:string;

  constructor() {
      addIcons({  chevronBackOutline });
    }

   goBack() {
        this.location.back();
      }


}
