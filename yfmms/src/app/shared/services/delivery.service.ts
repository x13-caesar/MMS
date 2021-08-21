import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Delivery} from '../models/delivery';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  target_controller = `${environment.API_URL}/delivery`

  constructor(private http: HttpClient) { }

  getDeliveries(): Observable<Delivery[]> {
    return this.http.get<Delivery[]>(`${this.target_controller}`)
  }

  getDeliveriesByBuyerId(buyer_id: number): Observable<Delivery[]> {
    return this.http.get<Delivery[]>(`${this.target_controller}/buyer_id/${buyer_id}`)
  }

  getDeliveriesByProductId(product_id: number): Observable<Delivery[]> {
    return this.http.get<Delivery[]>(`${this.target_controller}/product_id/${product_id}`)
  }

  postDelivery(delivery: Delivery): Observable<Delivery> {
    return this.http.post<Delivery>(`${this.target_controller}`, delivery);
  }

  putDelivery(delivery: Delivery): Observable<Delivery> {
    return this.http.put<Delivery>(`${this.target_controller}`, delivery);
  }
}
