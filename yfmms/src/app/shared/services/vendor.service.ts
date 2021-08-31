import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Vendor} from '../models/vendor';
import {environment} from '../../../environments/environment';
import {PostResponse} from '../models/post-response';

@Injectable({
  providedIn: 'root'
})
export class VendorService {

  constructor(private http: HttpClient) { }

  getVendors(): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(`${environment.API_URL}/vendors`)
  }

  getVendorById(vendor_id: number): Observable<Vendor> {
    return this.http.get<Vendor>(`${environment.API_URL}/vendors/${vendor_id}`)
  }

  postVendor(vendor: Vendor): Observable<Vendor> {
    return this.http.post<Vendor>(`${environment.API_URL}/vendors`, vendor)
  }

  putVendor(vendor: Vendor): Observable<Vendor> {
    return this.http.put<Vendor>(`${environment.API_URL}/vendors/${String(vendor.id)}`, vendor)
  }

  deleteVendor(vendor_id: number): Observable<PostResponse> {
    return this.http.delete<PostResponse>(`${environment.API_URL}/vendors/${String(vendor_id)}`)
  }

  vendorSearchFilter(vendors: Vendor[], keyword: string): Vendor[] {
    keyword = keyword.toUpperCase();
    return vendors.filter(
        vendor => vendor.company?.toUpperCase().includes(keyword)
          || vendor.name?.toUpperCase().includes(keyword)
          || vendor.address?.toUpperCase().includes(keyword)
          || vendor.notice?.toUpperCase().includes(keyword));
  }

}
