import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Employee} from '../models/employee';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  constructor(private http: HttpClient) { }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${environment.API_URL}/employee`)
  }

  getEmployeesByStatus(status: string): Observable<Employee[]> {
  return this.http.get<Employee[]>(`${environment.API_URL}/employee/status/${status}`)
}

  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${environment.API_URL}/employee/${String(id)}`)
  }

  getEmployeesByName(name: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${environment.API_URL}/employee/name/${name}`)
  }

  postEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(`${environment.API_URL}/employee`, employee)
  }

  putEmployee(employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${environment.API_URL}/employee`, employee)
  }
}
