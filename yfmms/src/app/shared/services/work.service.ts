import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Work} from '../models/work';
import {environment} from '../../../environments/environment';
import {PostResponse} from '../models/post-response';

@Injectable({
  providedIn: 'root'
})
export class WorkService {

  constructor(private http: HttpClient) { }


  getWorks(): Observable<Work[]> {
    return this.http.get<Work[]>(`${environment.API_URL}/work`)
  }

  getWorkNameById(id: number): Observable<any> {
    return this.http.get<any>(`${environment.API_URL}/work/only_name/${id}`)
  }

  getWorkById(work_id: number): Observable<Work> {
    return this.http.get<Work>(`${environment.API_URL}/work/${work_id}`)
  }

  getWorksByEmployeeId(employee_id: number): Observable<Work[]> {
    return this.http.get<Work[]>(`${environment.API_URL}/work/employee_id/${employee_id}`)
  }

  getWorksInDateRange(after: Date, before: Date): Observable<Work[]> {
    return this.http.get<Work[]>(`${environment.API_URL}/work/work_date/${after}/${before}`)
  }

  getWorksByEmployeeIdAndWorkDate(employee_id: number, after: Date, before: Date): Observable<Work[]> {
    return this.http.get<Work[]>(`${environment.API_URL}/work/employee_id_and_work_date/${employee_id}/${after}/${before}`)
  }

  postWork(work: Work): Observable<Work> {
    return this.http.post<Work>(`${environment.API_URL}/work`, work)
  }

  putWork(work: Work): Observable<Work> {
    return this.http.put<Work>(`${environment.API_URL}/work`, work)
  }

  deleteWork(work_id: number): Observable<PostResponse> {
    return this.http.delete<PostResponse>(`${environment.API_URL}/work/${work_id}`)
  }
}
