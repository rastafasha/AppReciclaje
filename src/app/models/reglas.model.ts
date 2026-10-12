export interface ReglasConcurso {
  _id?: string;             // ID único autogenerado por MongoDB Atlas
  diasRequeridos: number;   // Cantidad de días necesarios (ej. 21)
  primerLugar: string;      // Descripción del premio de primer lugar
  segundoLugar: string;     // Descripción del premio de segundo lugar
  tercerLugar: string;      // Descripción del premio de tercer lugar
  actualizadoEn?: string | Date; // Fecha de la última modificación en caliente
}
