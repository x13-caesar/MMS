import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Product} from '../models/product';
import {environment} from '../../../environments/environment';
import {Compo} from '../models/compo';
import {PostResponse} from '../models/post-response';

@Injectable({
  providedIn: 'root'
})
export class CompoService {

  constructor(
    private http: HttpClient
  ) { }

  getCompos(): Observable<Compo[]> {
    return this.http.get<Compo[]>(`${environment.API_URL}/components`)
  }

  getCompo(id: string): Observable<Compo> {
    return this.http.get<Compo>(`${environment.API_URL}/components/${id}`)
  }

  postCompo(compo: Compo): Observable<Compo> {
    return this.http.post<Compo>(`${environment.API_URL}/components`, compo)
  }

  putCompo(compo: Compo): Observable<Compo> {
    return this.http.put<Compo>(`${environment.API_URL}/components`, compo)
  }

  deleteCompo(compo_id: string): Observable<PostResponse> {
    return this.http.delete<PostResponse>(`${environment.API_URL}/components/${compo_id}`)
  }
}
