export interface IPerfil {
  id: string;
  usuario: string; // ID de relación
  first_name?: string;
  last_name?: string;
  phone_office?: string;
  phone_mobile?: string;
  avatar_url?: string;
  puntos_totales: number;   // Histórico acumulado
  puntos_actuales: number;  // Elegible si llega a >= 55 pts
  pais?: string;
  ciudad?: string;
  createdAt: string;
}

export interface IUsuario {
  uid: string;
  username: string;
  identificacion?: string;
  email: string;
  role: 'USER' | 'EDITOR' | 'SUPERADMIN';
  google: boolean;
  profile?: IPerfil; // Enlace relacional directo embebido
  createdAt: string;
}

// Interfaz para mapear las respuestas HTTP estandarizadas de tu backend de Node
export interface AuthResponse {
  ok: boolean;
  token?: string;
  usuario?: IUsuario;
  msg?: string;
}