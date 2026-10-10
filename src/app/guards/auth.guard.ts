import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, Route, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard  {

  constructor(private authService: AuthService,
    private router: Router){}

  canLoad(route: Route, segments: UrlSegment[]): boolean | Observable<boolean> | Promise<boolean> {
    return this.authService.validarToken()
    .pipe(
      tap( estaAutenticado => {
        if(!estaAutenticado){
          this.router.navigateByUrl('/login');
        }
      })
    );
  }



  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot){

    return this.authService.validarToken()
    .pipe(
      tap( estaAutenticado => {
        if(!estaAutenticado){
          this.router.navigateByUrl('/login');
        }
      })
    );
  }

}
