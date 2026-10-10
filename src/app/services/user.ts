import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IPerfil, IUsuario } from '../models/usuario.model';

const apiUrl = environment.apiUrl;

@Service()
export class UserService {

    private http = inject(HttpClient);

    // Getter centralizado para el token de autenticación que requiere validarJWT
  private get headers() {
    const tokenReal = localStorage.getItem('token') || '';
    console.log('🔑 Inyectando x-token en la petición HTTP:', tokenReal);
    return {
      headers: {
        'x-token': tokenReal
      }
    };
  }

  /**
   * 📋 Obtener lista paginada de usuarios (Uso administrativo)
   * GET /api/usuarios?desde=X
   */
  getUsuariosList(desde: number = 0): Observable<{ ok: boolean; usuarios: IUsuario[]; total: number }> {
    return this.http.get<{ ok: boolean; usuarios: IUsuario[]; total: number }>(
      `${apiUrl}/usuarios?desde=${desde}`
    );
  }

  /**
   * ✨ Obtener los 5 usuarios más recientes creados
   * GET /api/usuarios/recientes
   */
  getUsuariosRecientes(): Observable<{ ok: boolean; usuarios: IUsuario[] }> {
    return this.http.get<{ ok: boolean; usuarios: IUsuario[] }>(`${apiUrl}/usuarios/recientes`);
  }

  /**
   * 👥 Obtener el universo total de usuarios sin paginación (Requiere JWT)
   * GET /api/usuarios/all
   */
  getAllUsers(): Observable<{ ok: boolean; usuarios: Partial<IUsuario>[] }> {
    return this.http.get<{ ok: boolean; usuarios: Partial<IUsuario>[] }>(
      `${apiUrl}/usuarios/all`, 
      this.headers
    );
  }

  /**
   * 📝 Listar usuarios que tengan rol EDITOR
   * GET /api/usuarios/editores
   */
  getAllEditores(): Observable<{ ok: boolean; editores: IUsuario[] }> {
    return this.http.get<{ ok: boolean; editores: IUsuario[] }>(`${apiUrl}/usuarios/editores`);
  }

  /**
   * 🔍 Obtener un único usuario por su UID de MongoDB (Requiere JWT)
   * GET /api/usuarios/:id
   */
  getUsuarioPorId(id: string): Observable<{ ok: boolean; usuario: IUsuario }> {
    return this.http.get<{ ok: boolean; usuario: IUsuario }>(
      `${apiUrl}/usuarios/${id}`, 
      this.headers
    );
  }

  /**
   * 🖼️ Listar información asociada al perfil detallado del usuario (Puntajes)
   * GET /api/usuarios/user_profile/:id
   */
  getProfileUsuario(id: string): Observable<{ ok: boolean; profile: IPerfil | null }> {
    // 🚀 IMPORTANTE: Le pasamos 'this.headers' para que viaje el 'x-token' que acabas de descubrir
    return this.http.get<{ ok: boolean; profile: IPerfil | null }>(
      `${apiUrl}/usuarios/user_profile/${id}`,
      this.headers
    );
  }

  /**
   * 🆕 Registrar / Crear un usuario común (Flujo del stepper de registro)
   * POST /api/usuarios/crear
   */
  crearUsuario(body: Pick<IUsuario, 'username' | 'email'> & { password: string }): Observable<{ ok: boolean; usuario: IUsuario; profile: IPerfil }> {
    return this.http.post<{ ok: boolean; usuario: IUsuario; profile: IPerfil }>(
      `${apiUrl}/usuarios/crear`, 
      body
    );
  }

  /**
   * 🛠️ Crear un usuario con rol de Editor (Uso administrativo)
   * POST /api/usuarios/crearEditor
   */
  crearEditor(body: any): Observable<{ ok: boolean; usuario: IUsuario }> {
    return this.http.post<{ ok: boolean; usuario: IUsuario }>(
      `${apiUrl}/usuarios/crearEditor`, 
      body
    );
  }

  /**
   * 🔄 Actualizar perfil de usuario regular (Modificar datos propios)
   * PUT /api/usuarios/editar/:id
   */
  actualizarUsuario(id: string, body: { username: string; email: string }): Observable<{ ok: boolean; usuario: IUsuario }> {
    return this.http.put<{ ok: boolean; usuario: IUsuario }>(
      `${apiUrl}/usuarios/editar/${id}`, 
      body, 
      this.headers
    );
  }

  /**
   * 🏷️ Modificar explícitamente el rol de un usuario (Admin task)
   * PUT /api/usuarios/editarRole/:id
   */
  actualizarUsuarioRole(id: string, role: string): Observable<{ ok: boolean; usuario: IUsuario }> {
    return this.http.put<{ ok: boolean; usuario: IUsuario }>(
      `${apiUrl}/usuarios/editarRole/${id}`, 
      { role }, 
      this.headers
    );
  }

  /**
   * 👑 Actualizar campos administrativos completos (Admin / SuperAdmin)
   * PUT /api/usuarios/editarAdmin/:id
   */
  actualizarUsuarioAdmin(id: string, body: { username: string; email: string; role: string }): Observable<{ ok: boolean; usuario: IUsuario }> {
    return this.http.put<{ ok: boolean; usuario: IUsuario }>(
      `${apiUrl}/usuarios/editarAdmin/${id}`, 
      body, 
      this.headers
    );
  }

  /**
   * 🗑️ Eliminar un usuario permanentemente de la base de datos (Requiere JWT)
   * DELETE /api/usuarios/delete/:id
   */
  borrarUsuario(id: string): Observable<{ ok: boolean; msg: string }> {
    return this.http.delete<{ ok: boolean; msg: string }>(
      `${apiUrl}/usuarios/delete/${id}`, 
      this.headers
    );
  }

  /**
   * 🔒 Iniciar proceso de recuperación de contraseña
   * GET /api/usuarios/user_token/set/:email
   */
  setTokenRecovery(email: string): Observable<{ ok: boolean; msg: string }> {
    return this.http.get<{ ok: boolean; msg: string }>(`${apiUrl}/usuarios/user_token/set/${email}`);
  }

  /**
   * 🔑 Verificar el token de recuperación provisto por el usuario
   * GET /api/usuarios/user_verify/token/:email/:codigo
   */
  verifyTokenRecovery(email: string, codigo: string): Observable<{ ok: boolean; msg: string }> {
    return this.http.get<{ ok: boolean; msg: string }>(
      `${apiUrl}/usuarios/user_verify/token/${email}/${codigo}`
    );
  }

  /**
   * 🔄 Consolidar el cambio de contraseña definitivo
   * PUT /api/usuarios/user_password/change/:email
   */
  changePassword(email: string, password: string): Observable<{ ok: boolean; msg: string }> {
    return this.http.put<{ ok: boolean; msg: string }>(
      `${apiUrl}/usuarios/user_password/change/${email}`, 
      { password }
    );
  }



}
