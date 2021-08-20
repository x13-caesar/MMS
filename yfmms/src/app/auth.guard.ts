import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import { JWTTokenService } from './shared/services/jwt-token.service';
import { LocalStorageService } from './shared/services/local-storage.service';
import {AuthService} from './shared/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthorizeGuard implements CanActivate {
  constructor(private authService: AuthService,
              private authStorageService: LocalStorageService,
              private jwtService: JWTTokenService,
              private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.jwtService.getUser() && this.jwtService.isTokenExpired()) {
        return true;
    } else {
      return this.router.navigateByUrl('/login');
    }
  }
}
