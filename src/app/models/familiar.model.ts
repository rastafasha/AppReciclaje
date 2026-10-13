export interface IFamiliar {
  _id?: string;          // Generado automáticamente por Mongoose Atlas
  usuario?: string;     // Relación con el ID del usuario creador
  nombre: string;   // Nombre del familiar
  apellido: string;    // Apellido del familiar
  parentesco: 'Esposa / Esposo' | 'Hijo / Hija' | 'Padre / Madre' | 'Hermano / Hermana';
  createdAt?: string;
}

// Interfaz para mapear la respuesta HTTP del controlador
export interface FamiliarResponse {
  ok: boolean;
  msg?: string;
  familiar?: IFamiliar;
  familiares?: IFamiliar[];
}