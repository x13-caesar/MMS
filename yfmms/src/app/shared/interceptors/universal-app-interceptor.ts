import { Injectable, Inject, Optional } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import {AuthService} from '../services/auth.service';
import {JWTTokenService} from '../services/jwt-token.service';

@Injectable()
export class UniversalAppInterceptor implements HttpInterceptor {

  constructor( private authService: AuthService,
               private jwtTokenService: JWTTokenService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.jwtTokenService.jwtToken;
    req = req.clone({
      url:  req.url,
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next.handle(req);
  }
}
