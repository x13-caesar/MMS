import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Employee} from '../../shared/models/employee';
import {EmployeeService} from '../../shared/services/employee.service';

@Component({
  selector: 'app-create-employee-dialog',
  templateUrl: './create-employee-dialog.component.html',
  styleUrls: ['./create-employee-dialog.component.scss']
})
export class CreateEmployeeDialogComponent implements OnInit {

  employeeGroup!: FormGroup;
  newEmployee!: Employee

  constructor(
    public dialogRef: MatDialogRef<CreateEmployeeDialogComponent>,
    private formBuilder: FormBuilder,
    private employeeService: EmployeeService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.employeeGroup = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      gender: new FormControl('', Validators.required),
      birth: new FormControl(''),
      phone: new FormControl('', Validators.required),
      ssn: new FormControl(''),
      department: new FormControl(''),
      notice: new FormControl('')
    })
  }

  onSubmit(form: FormGroup): void {
    const newEmployee = {...form.value, status: 'working', onboard: new Date()};
    console.log(newEmployee);
    this.employeeService.postEmployee(newEmployee).subscribe(
      res => {
        this.dialogRef.close(res)
      },
      error => {
        console.log(error);
        this.onFailure();
      }
    )
  }

  onFailure(): void {
    this._snackBar.open(`创建失败`, "关闭");
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
