import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';
import { IAvanceDiario } from '../models/avance.model';

const apiUrl= environment.apiUrl


// Interfaz para el tipado de los materiales en el front
export interface MaterialReciclado {
nombreItem: any;
categoria: string;
comida: any;
  id?: string;
  tipo: 'PLASTICO' | 'VIDRIO' | 'PAPEL_CARTON' | 'METAL' | 'ORGANICO' | 'ELECTRONICO';
  pesoEnGramos: number;
  puntosOtorgados: number;
  detalleOpcional?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MaterialesService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = apiUrl+'/materiales';

  // 🚦 Angular 22 Signals: Estado reactivo global del historial
   public historial = signal<IAvanceDiario[]>([]);
  public totalRegistros = signal<number>(0);

  // 🚀 SIGNAL COMPUTADA 1: Calcula el Rango al vuelo basándose en los puntos reales
  public rangoActual = computed<string>(() => {
    const pts = this.totalRegistros();
    if (pts >= 55) return 'Elegible para Premio 👑';
    if (pts >= 18) return 'Soldado 🎖️';
    if (pts >= 9)  return 'Aprendiz 🦅';
    return 'Pollito 🐥';
  });

  // 🚀 SIGNAL COMPUTADA 2: Define el subtítulo o medalla para las tarjetas
  public esElegibleSorteo = computed<boolean>(() => {
    return this.totalRegistros() >= 55;
  });

  

  /**
   * 🔒 Helper para inyectar el x-token en las peticiones HTTP
   */
  private get headers() {
    return new HttpHeaders({
      'x-token': this.authService.token
    });
  }

  /**
   * 📜 Obtener el historial completo del reciclador (Alimenta las Signals)
   */
 getHistorial() {
    return this.http.get<{ ok: boolean, totalRegistros: number, historial: IAvanceDiario[] }>(
      `${this.baseUrl}/historial`, 
      { headers: this.headers }
    ).pipe(
      tap(resp => {
        if (resp.ok) {
          this.historial.set(resp.historial);
          this.totalRegistros.set(resp.totalRegistros);
        }
      })
    );
  }

  crearEntrega(avance: IAvanceDiario) {
    return this.http.post<{ ok: boolean, avance: IAvanceDiario }>(
      this.baseUrl, 
      avance, 
      { headers: this.headers }
    ).pipe(
      tap(resp => {
        if (resp.ok) {
          this.historial.update(lista => [resp.avance, ...lista]);
          this.totalRegistros.update(total => total + 1);
        }
      })
    );
  }
}
