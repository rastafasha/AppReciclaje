import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { ReglasConcurso } from '../models/reglas.model';

@Service()
export class ReglasService {
    private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reglas`;

  // Signal para almacenar el estado globalmente
  public reglas = signal<ReglasConcurso | null>(null);

  /**
   * Obtiene las reglas desde el servidor lógico y actualiza el Signal
   */
  obtenerReglas() {
    this.http.get<ReglasConcurso>(this.apiUrl).subscribe({
      next: (data) => this.reglas.set(data),
      error: (err) => console.error('🚨 Error al traer las reglas desde el front:', err)
    });
  }
}
