import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {User} from '../models/user';
import {environment} from '../../../environments/environment';
import jwt_decode from 'jwt-decode';
import {JWTTokenService} from './jwt-token.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public user: any = null;

  constructor(
    private http: HttpClient,
    private jwtTokenService: JWTTokenService
  ) {
  }

  login(user: any): Observable<{ access_token: string, token_type: string }> {
    const userFormData = new HttpParams()
      .append('username', user.username)
      .append('password', user.password);
    return this.http.post<{ access_token: string, token_type: string }>(
      `${environment.API_URL}/token`, userFormData,
      {withCredentials: true});
  }

}
