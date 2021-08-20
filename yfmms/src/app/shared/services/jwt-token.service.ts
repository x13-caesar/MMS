import { Injectable } from '@angular/core';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class JWTTokenService {

  jwtToken = '';
  decodedToken: { [key: string]: string } = {};

  constructor() {
  }

  setToken(token: string): void {
    if (token) {
      this.jwtToken = token;
    }
  }

  decodeToken(): void {
    if (this.jwtToken) {
      this.decodedToken = jwt_decode(this.jwtToken);
    }
  }

  getDecodeToken(): any {
    return jwt_decode(this.jwtToken);
  }

  getUser(): any {
    this.decodeToken();
    return this.decodedToken ? this.decodedToken.displayname : null;
  }

  getExpiryTime(): any {
    this.decodeToken();
    return this.decodedToken ? this.decodedToken.exp : null;
  }

  isTokenExpired(): boolean {
    const expiryTime: number = this.getExpiryTime();
    if (expiryTime) {
      return ((1000 * expiryTime) - (new Date()).getTime()) < 5000;
    } else {
      return false;
    }
  }
}
