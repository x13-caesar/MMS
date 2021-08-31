import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Batch} from '../models/batch';
import {environment} from '../../../environments/environment';
import {PostResponse} from '../models/post-response';

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

  getBatchesByProductIdAndStatus(product_id: string, status: string): Observable<Batch[]> {
    return this.http.get<Batch[]>(`${environment.API_URL}/product_id/${product_id}/${status}`)
  }

  getUnfinishedBatches(): Observable<Batch[]> {
    return this.http.get<Batch[]>(`${environment.API_URL}/batch/unfinished`)
  }

  getWorkingBatches(): Observable<Batch[]> {
    return this.http.get<Batch[]>(`${environment.API_URL}/batch/working`)
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

  completeBatch(batch_id: number, actual_amount: number): Observable<Batch> {
    return this.http.put<Batch>(`${environment.API_URL}/batch/complete/${batch_id}/${actual_amount}`, null)
  }

  autoUpdateBatchStatus(): Observable<PostResponse> {
    return this.http.put<PostResponse>(`${environment.API_URL}/batch/auto_update_status`, null)
  }

  getRecentFinishedBatches(): Observable<Batch[]> {
    return this.http.get<Batch[]>(`${environment.API_URL}/batch/recent`)
  }
}
