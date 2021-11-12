import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {Spec} from '../models/spec';
import {PostResponse} from '../models/post-response'

@Injectable({
  providedIn: 'root'
})
export class SpecService {

  constructor(
    private http: HttpClient
  ) { }

  getSpecs(): Observable<Spec[]> {
    return this.http.get<Spec[]>(`${environment.API_URL}/specifications`)
  }

  getSpecById(specification_id: string): Observable<Spec> {
    return this.http.get<Spec>(`${environment.API_URL}/specifications/${specification_id}`)
  }

  getSpecsByCompoId(compo_id: string): Observable<Spec[]> {
    return this.http.get<Spec[]>(`${environment.API_URL}/specifications/component_id/${compo_id}`)
  }

  adjustSpecStock(spec_id: string, adjust_number: number): Observable<Spec> {
    return this.http.put<Spec>(`${environment.API_URL}/specifications/adjust_stock/${spec_id}/${adjust_number}`, null)
  }

  postSpec(spec: Spec): Observable<Spec> {
    return this.http.post<Spec>(`${environment.API_URL}/specifications/`, spec)
  }

  putSpec(spec: Spec): Observable<Spec> {
    return this.http.put<Spec>(`${environment.API_URL}/specifications/`, spec)
  }

  getExistingIds(): Observable<string[]> {
    return this.http.get<string[]>(`${environment.API_URL}/specifications/existing_ids`)
  }

  deleteSpec(spec_id: string): Observable<PostResponse> {
    return this.http.delete<PostResponse>(`${environment.API_URL}/specifications/${spec_id}`)
  }
}
