import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { notificationsOutline, menuOutline, refreshCircleOutline, documentTextOutline, personCircleOutline } from 'ionicons/icons';
import { IonContent,  IonBadge } from '@ionic/angular';
import { MaterialesService } from '../../services/materiales';
import { HeaderComponent } from '../../shared/header/header.component';
import { SkeletonLoaderComponent } from '../../shared/skeleton-loader/skeleton-loader.component';
import { BackbuttonComponent } from '../../shared/backbutton/backbutton.component';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonBadge, RouterModule,  HeaderComponent, SkeletonLoaderComponent, BackbuttonComponent]
})
export class HistorialPage implements OnInit{
  private router = inject(Router);
  public materialesService = inject(MaterialesService);

  public isLoading = signal<boolean>(false);

  // Exponemos las Signals reactivas del servicio global
  public historial = this.materialesService.historial;
  public total = this.materialesService.totalRegistros;

  constructor() {
    addIcons({ notificationsOutline, menuOutline, refreshCircleOutline, documentTextOutline, personCircleOutline });

    
  }

  ngOnInit() {
    this.isLoading.set(true);
    // ⚡ CONEXIÓN REAL: Al cargar la pantalla, consultamos los datos reales del seeder en Atlas
    this.materialesService.getHistorial().subscribe({
      next: (resp) => {
        console.log('✅ Historial real cargado desde MongoDB Atlas:', resp);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('❌ Error consultando el historial en Node.js:', err);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * 🎨 Helper adaptado al Figma para pintar colores según la categoría alimenticia
   */
  getCategoryColor(categoria: string): string {
    const colores: Record<string, string> = {
      'PROTEINAS': 'danger',       // Rojo
      'CARBOHIDRATOS': 'warning',  // Amarillo/Naranja
      'VEGETALES_FRUTAS': 'success' // Verde saludable
    };
    return colores[categoria] || 'primary';
  }

  // Métodos de navegación de las pestañas inferiores
  irANotificaciones() { this.router.navigateByUrl('/notificaciones'); }
  irAlInicio() { this.router.navigateByUrl('/inicio'); }
  irAlPerfil() { this.router.navigateByUrl('/mi-cuenta'); }
}
