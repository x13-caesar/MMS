import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Employee} from '../models/employee';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  public employees: Employee[] = [];

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

  employeeDisplayFn(emp: Employee): string {
    return emp && emp.name ? `${emp.name} | ${emp.id}` : '';
  }

  employeeAutocompleteFilter(value: string, employees: Employee[] = this.employees): Employee[] {
    return employees.filter(e => e.name.includes(value) || String(e.id) === value);
  }

  updateLastPayCheck(employee_id: number, last_pay_check: Date) {
    return this.http.put<Employee>(`${environment.API_URL}/employee/last_check_date`, {employee_id: employee_id, last_pay_check: last_pay_check})
  }
}
