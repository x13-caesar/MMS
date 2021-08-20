import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Employee} from '../shared/models/employee';
import {MatPaginator} from '@angular/material/paginator';
import {EmployeeService} from '../shared/services/employee.service';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatTableDataSource} from '@angular/material/table';
import {environment} from '../../environments/environment';
import {CreateEmployeeDialogComponent} from './create-employee-dialog/create-employee-dialog.component';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent implements OnInit, AfterViewInit{
  displayedColumns: string[] = [
    'id', 'name', 'gender', 'phone',
    'ssn', 'department', 'notice', 'edit'
  ];

  searchKeyword = new FormControl('')
  employees: Employee[] = [];
  dataSource: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(
    private employeeService: EmployeeService,
    public dialog: MatDialog,
    public _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.employeeService.getEmployees().subscribe(
      res => {
        this.employees = res;
        this.dataSource = new MatTableDataSource<Employee>(this.employees);
        this.dataSource.paginator = this.paginator;
      },
      error => console.log(error)
    );
    this.searchKeyword.valueChanges.subscribe(
      kw => {
        this.dataSource = new MatTableDataSource<Employee>(this.employeeSearchFilter(kw));
        this.dataSource.paginator = this.paginator;
      })
  }

  openCreateEmployeeDialog(): void {
    const dialogRef = this.dialog.open(CreateEmployeeDialogComponent, {
      width: environment.SMALL_DIALOG_WIDTH
    });

    dialogRef.afterClosed().subscribe(new_employee => {
      this.employees.push(new_employee);
      this.dataSource = new MatTableDataSource<Employee>(this.employees);
    });
  }

  employeeSearchFilter(keyword: string): Employee[] {
    return keyword
      ? this.employees.filter(
        employee => employee.name.includes(keyword) || (employee.notice && employee.notice.includes(keyword)))
      : this.employees
  }

  onEmployeeSubmit(employee: Employee): void {
    this.employeeService.putEmployee(employee).subscribe(
      res => this.onSuccess('修改员工信息'),
      error => this.onFailure('修改员工信息')
    )
  }

  onSuccess(eventString: string): void {
    this._snackBar.open(`${eventString}成功`, "关闭");
  }

  onFailure(eventString: string): void {
    this._snackBar.open(`${eventString}失败`, "关闭");
  }

}
