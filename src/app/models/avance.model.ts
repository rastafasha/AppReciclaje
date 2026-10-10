export type TipoComida = 'DESAYUNO' | 'ALMUERZO' | 'CENA';
export type CategoriaAlimento = 'PROTEINAS' | 'CARBOHIDRATOS' | 'VEGETALES_FRUTAS';

export interface IAvanceDiario {
  id?: string;
  usuario?: string;
  comida: TipoComida;
  categoria: CategoriaAlimento;
  nombreItem: string;
  descripcion: string;
  puntosOtorgados: number; // Equivale a 1 punto por registro
  fechaString?: string;    // Bloqueador de duplicados 'YYYY-MM-DD'
  createdAt?: string;
}
