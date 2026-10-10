import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private _router: Router) {
  }


  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    let authReq = req;

    // 1. Si hay token, clonamos la petición UNA SOLA VEZ
    if (token) {
      authReq = req.clone({
        setHeaders: {
          'x-token': token,
          'Accept': 'application/json'
        }
      });
    }

    // 2. Pasamos la petición clonada (authReq) directamente
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // SOLO si el error es 401 (Token inválido/expirado)
        if (error.status === 401) {
          // localStorage.clear();
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('estaAutenticado');
          Swal.fire({
            title: 'Sesión expirada',
            text: 'Por favor inicia sesión nuevamente.',
            icon: 'warning',
            confirmButtonText: 'Ir al Login'
          }).then(() => {
            this._router.navigate(['/login']);
          });
        }
        // Si el error es 0, 403 o 500, el interceptor NO hace nada y deja que el componente lo maneje
        return throwError(() => error);
      })
    );
  }


  errors(error: HttpErrorResponse) {
    if (error.status === 4030 || error.status === 4040 || error.status === 4230) {
      this._router.navigate(['/login']);
    }
    return throwError(error);
  }
}

