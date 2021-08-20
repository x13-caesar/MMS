import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Batch} from '../models/batch';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BatchService {

  constructor(private http: HttpClient) { }

  getBatches(): Observable<Batch[]> {
    return this.http.get<Batch[]>(`${environment.API_URL}/batch`)
  }

  getBatch(id: number): Observable<Batch> {
    return this.http.get<Batch>(`${environment.API_URL}/batch/${id}`)
  }

  getBatchesByStatus(status: string): Observable<Batch[]> {
    return this.http.get<Batch[]>(`${environment.API_URL}/batch/status/${status}`)
  }

  getUnfinishedBatches(): Observable<Batch[]> {
    return this.http.get<Batch[]>(`${environment.API_URL}/batch/unfinished`)
  }

  getCollectedBatches(): Observable<Batch[]> {
    return this.http.get<Batch[]>(`${environment.API_URL}/batch/collected`)
  }

  postBatch(batch: Batch): Observable<Batch> {
    return this.http.post<Batch>(`${environment.API_URL}/batch`, batch)
  }

  putBatch(batch: Batch): Observable<Batch> {
    return this.http.put<Batch>(`${environment.API_URL}/batch`, batch)
  }


}
