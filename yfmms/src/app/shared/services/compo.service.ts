import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Product} from '../models/product';
import {environment} from '../../../environments/environment';
import {Compo, CompoCategory} from '../models/compo';
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

  getCompoCategories(): Observable<CompoCategory[]> {
    return this.http.get<CompoCategory[]>(`${environment.API_URL}/components/all_categories`)
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

  compoSearchFilter(compos: Compo[], changes: any): Compo[] {
    changes.material && (changes.material = changes.material.toUpperCase());
    changes.keyword && (changes.keyword = changes.keyword.toUpperCase());
    return compos
      .filter(compo => !changes.category || (compo.category.toUpperCase() === changes.category))
      .filter(compo => !changes.material || (compo.material?.toUpperCase() === changes.material))
      .filter(compo => compo.id?.includes(changes.keyword)
        || compo.name.toUpperCase().includes(changes.keyword)
        || compo.description?.toUpperCase().includes(changes.keyword)
        || (compo.notice && compo.notice.toUpperCase().includes(changes.keyword)))
  }

  getExistingIds(): Observable<string[]> {
    return this.http.get<string[]>(`${environment.API_URL}/components/existing_ids`)
  }

  compoAutocompleteFilter(value: string, compos: Compo[]): Compo[] {
    value = value.toUpperCase();
    return compos.filter(c => c.name.includes(value) || c.id?.includes(value));
  }

  compoDisplayFn(compo: Compo): string {
    return compo && compo.name ? `${compo.name} | ${compo.id}` : '';
  }
}
