import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../environments/environment';

const base_url = environment.mediaUrlRemoto;

@Pipe({
    name: 'imagenPipe',
    standalone: true,
})
export class ImagenPipe implements PipeTransform {

  transform(img: string | undefined | null, tipo: 'usuarios' | 'perfiles'): string {
    // 1. Si no viene ninguna imagen, retornamos el asset por defecto
    if (!img || img.trim() === '') {
      return 'assets/images/default.jpeg';
    } 

    // 2. 🛡️ FILTRO CRÍTICO: Si ya es una URL segura de Cloudinary, la retornamos intacta
    if (img.includes('http://') || img.includes('https://')) {
      return img;
    } 

    // 3. Si viene un ID plano de archivo, consumimos el endpoint de Express que creaste
    return `${base_url}/uploads/${tipo}/${img}`;
  }

}
