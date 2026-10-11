import { environment } from "../../environments/environment";

const base_url = environment.mediaUrlRemoto;
export class IPerfil {

  constructor(
  public id: string,
  public usuario: string, // ID de relación
  public first_name?: string,
  public last_name?: string,
  public phone_office?: string,
  public phone_mobile?: string,
  public puntos_totales?: number,   // Histórico acumulado
  public puntos_actuales?: number,  // Elegible si llega a >= 55 pts
  public pais?: string,
  public ciudad?: string,
  public createdAt?: string,
  ){}

  avatar_url?: string;
     get imagenUrl(){

      if(!this.avatar_url){
        return `assets/images/default.jpeg`;
      } else if(this.avatar_url.includes('https')){
        return this.avatar_url;
      } else if(this.avatar_url){
        return `${base_url}/pagos/${this.avatar_url}`;
      }else {
        return `${base_url}/pagos/no-image.jpg`;
      }

    }
  
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

