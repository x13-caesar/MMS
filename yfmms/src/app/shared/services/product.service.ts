import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Product} from '../models/product';
import {environment} from '../../../environments/environment';
import {PostResponse} from '../models/post-response';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(
    private http: HttpClient
  ) { }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.API_URL}/products`)
  }

  getProductNameById(id: number): Observable<any> {
    return this.http.get<any>(`${environment.API_URL}/products/only_name/${id}`)
  }

  getProductById(product_id: number): Observable<Product> {
    return this.http.get<Product>(`${environment.API_URL}/products/${product_id}`)
  }

  getProductsByName(name: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.API_URL}/products/name/${name}`)
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.API_URL}/products/category/${category}`)
  }

  getProductsUnderInventory(inventory: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.API_URL}/products/inventory_under/${inventory}`)
  }

  postProduct(product: Product): Observable<PostResponse> {
    return this.http.post<PostResponse>(`${environment.API_URL}/products`, product)
  }

  putProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(`${environment.API_URL}/products`, product)
  }

  deleteProduct(product_id: number): Observable<PostResponse> {
    return this.http.delete<PostResponse>(`${environment.API_URL}/products/${product_id}`)
  }
}
