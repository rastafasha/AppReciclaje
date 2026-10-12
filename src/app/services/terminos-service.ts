import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { TerminosCondiciones } from '../models/terminos.model';

@Service()
export class TerminosService {
    private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/terminos`;

  // Signal reactivo para almacenar los estatutos legales globales
  public terminos = signal<TerminosCondiciones | null>(null);

  /**
   * Obtiene los términos y condiciones desde MongoDB Atlas y actualiza el Signal
   */
  obtenerTerminos() {
    this.http.get<TerminosCondiciones>(this.apiUrl).subscribe({
      next: (data) => this.terminos.set(data),
      error: (err) => console.error('🚨 Error al traer los términos desde el front:', err)
    });
  }
}
