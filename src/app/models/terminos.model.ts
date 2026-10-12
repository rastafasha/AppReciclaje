export interface TerminosCondiciones {
  _id?: string;
  tituloGlobal: string;
  introduccion: string;
  secciones: {
    subtitulo: string;
    contenido: string;
  }[];
  version: string;
  actualizadoEn?: string | Date;
}