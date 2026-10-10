import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

const CLIENT = 'AQhKPBY5mgg0JustLJCcf6ncmd9RghCiNhXT_b6rNUakyQtnEn8MzCn_dkHAyt5n7_P0Omo5M05to5j0';
const SECRET = 'EFFuT6X5iP76O94nCeLrILzQCtCpqDc1EbBUMDKlj34B_55Pk_f4reWcvmFArH4oQklbeHZdsunITll0';
const PAYPAL_API = 'https://api-m.sandbox.paypal.com';

const auth = { user: CLIENT, pass: SECRET };


@Injectable()
export class PaypalInterceptor implements HttpInterceptor {
  constructor(private _router: Router) {
  }


    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      let headers = new HttpHeaders();
      let params = req.params;
      if (localStorage.getItem('token')) {
        headers = headers.append('Accept', 'application/json')
          .append('Authorization', 'Bearer ' + `${auth.user}: ${auth.pass}`);
      } else {
        headers = headers.append('Accept', 'application/json');
        // params = params.append('page', '1');
      }

      return next.handle(req.clone({headers, params})).pipe(catchError(error => {
        if (error.status === 401 || error.status === 423) {
          // this._router.navigate(['/login']);
        }

        return throwError(error);
      }));
    }

    errors(error: HttpErrorResponse) {
      if (error.status === 4030 || error.status === 4040 || error.status === 4230) {
        // this._router.navigate(['/login']);
      }
      return throwError(error);
    }
}

