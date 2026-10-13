export interface ITipEcologico {
  _id?: string;
  titulo: string;
  descripcion: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TipEcologicoResponse {
  ok: boolean;
  data: ITipEcologico[];
}