import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { ITipEcologico, TipEcologicoResponse } from '../models/tip-ecologico.model';

@Service()
export class ConsejoService {
    private http = inject(HttpClient);
  private apiUrl = environment.apiUrl; 

  // 🚦 SIGNAL REACTIVA: Almacén central de consejos en el smartphone
  public tipsInApp = signal<ITipEcologico[]>([]);
  public isLoading = signal<boolean>(false);

  /**
   * 🛡️ CABECERAS CON TOKEN: Requerido por tu middleware validarJWT en Node.js
   */
  private get headers() {
    return {
      headers: new HttpHeaders({
        'x-token': localStorage.getItem('token') || ''
      })
    };
  }

  /**
   * 📡 CARGAR CONSEJOS DESDE ATLAS
   * Descarga el saco de píldoras ecológicas y filtra en caliente las que están activas
   */
  cargarConsejosDelConcurso(): void {
    this.isLoading.set(true);
    
    // Apunta exactamente a tu ruta: GET /api/comunicados/tips
    this.http.get<TipEcologicoResponse>(`${this.apiUrl}/consejos`, this.headers)
      .subscribe({
        next: (resp) => {
          if (resp.ok && resp.data) {
            // En el celular solo queremos mostrar los consejos que el administrador tenga marcados como activos
            const consejosActivos = resp.data.filter(tip => tip.activo);
            this.tipsInApp.set(consejosActivos);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('❌ Error al recuperar las píldoras desde el smartphone:', err);
          this.isLoading.set(false);
        }
      });
  }
}
