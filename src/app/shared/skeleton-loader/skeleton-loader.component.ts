// src/app/shared/skeleton-loader/skeleton-loader.component.ts
import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  templateUrl: './skeleton-loader.component.html',
  styleUrls: ['./skeleton-loader.component.scss'],
  standalone: true, // 🚀 Obligatorio en tu arquitectura sin app.module.ts
  imports: [CommonModule],
})
export class SkeletonLoaderComponent {
  // 🚦 Usamos la API moderna input() de Angular 22 con fallbacks por defecto
  public rows = input<number>(5);
  public columns = input<number>(5);
  public template = input<string>('');

  get rowArray(): number[] {
    return Array(this.rows()).fill(0).map((_, i) => i);
  }

  get columnArray(): number[] {
    return Array(this.columns()).fill(0).map((_, i) => i);
  }

  // Calcula dinámicamente el flex-grow de cada celda basado en tu string de plantilla
  getColumnWidth(index: number): string {
    if (!this.template()) {
      return '1';
    }
    const templateArray = this.template().padEnd(this.columns(), '1').split('');
    return templateArray[index] || '1';
  }
}
