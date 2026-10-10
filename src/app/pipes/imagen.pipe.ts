import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../environments/environment';

const base_url = environment.mediaUrlRemoto;

@Pipe({
    name: 'imagenPipe',
    standalone: true,
})
export class ImagenPipe implements PipeTransform {

  transform(img: string, tipo: 'usuarios'): string {

    if(!img){
      return `images/no-image.jpg`;
    } else if(img.includes('https')){
      return img;
    } else if(img){
      return `${base_url}/${tipo}/${img}`;
    }else {
      // return `${base_url}/no-image.jpg`;
      return `./images/no-image.jpg`;

    }


  }

}
