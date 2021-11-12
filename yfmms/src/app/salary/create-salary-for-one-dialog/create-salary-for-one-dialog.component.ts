import {Component, Inject, OnInit} from '@angular/core';
import {Employee} from '../../shared/models/employee';
import {Observable} from 'rxjs';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {EmployeeService} from '../../shared/services/employee.service';
import {Salary} from '../../shared/models/salary';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CreateWorkDialogComponent} from '../../manufacture/create-work-dialog/create-work-dialog.component';
import {WorkService} from '../../shared/services/work.service';
import {map} from 'rxjs/operators';
import {SalaryService} from '../../shared/services/salary.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DayInvoiceService} from '../../shared/services/day-invoice.service';

class DialogData {
  employees!: Employee[];
  target_employee!: Employee;
  start_date!: Date;
  end_date!: Date;
}

@Component({
  selector: 'app-create-salary-for-one-dialog',
  templateUrl: './create-salary-for-one-dialog.component.html',
  styleUrls: ['./create-salary-for-one-dialog.component.scss']
})
export class CreateSalaryForOneDialogComponent implements OnInit {
  employees: Employee[] = [];
  employeeOptions!: Observable<Employee[]>;

  salaryGroup!: FormGroup;
  total!: number;

  previewSalary!: Salary;
  payNow!: boolean;


  constructor(
    public dialogRef: MatDialogRef<CreateSalaryForOneDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public employeeService: EmployeeService,
    private salaryService: SalaryService,
    private DIService: DayInvoiceService,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) { }


  ngOnInit(): void {
    this.employees = this.data.employees;
    this.salaryGroup = this.formBuilder.group({
      employee: new FormControl(null, Validators.required),
      start_date: new FormControl(null, Validators.required),
      end_date: new FormControl(null, Validators.required),
      deduction: new FormControl(0, Validators.min(0)),
      bonus: new FormControl(0, Validators.min(0)),
      notice: new FormControl('')
    });
    this.employeeOptions = this.salaryGroup.controls['employee'].valueChanges.pipe(
      map(name => this.employeeService.employeeAutocompleteFilter(name, this.employees)));
    this.data.target_employee && this.salaryGroup.controls['employee'].setValue(this.data.target_employee)
    this.data.start_date && this.salaryGroup.controls['start_date'].setValue(this.data.start_date)
    this.data.end_date && this.salaryGroup.controls['end_date'].setValue(this.data.end_date)
  }

  onPreviewConfirm() {
    this.previewSalary = {
      notice: this.salaryGroup.controls['notice'].value,
      bonus: 0, deduction: 0, hour_salary: 0, unit_salary: 0, status: this.payNow ? 'paid' : 'unpaid',
      employee_name: this.salaryGroup.controls['employee'].value.name,
      employee_id: this.salaryGroup.controls['employee'].value.id,
      start_date: this.salaryGroup.controls['start_date'].value,
      end_date: this.salaryGroup.controls['end_date'].value
    }
    this.DIService.getUncheckedDayInvoicesByEmployeeIdAndDayInvoiceDate(
      this.salaryGroup.controls['employee'].value.id,
      this.salaryGroup.controls['start_date'].value,
      this.salaryGroup.controls['end_date'].value).subscribe(
        ret_works => {
          this.previewSalary.day_invoice = this.DIService.sortDayInvoiceByDate(ret_works);
          this.previewSalary.hour_salary = Number(this.previewSalary.day_invoice?.reduce(
            (prev, curr) => prev + (curr.hour_pay * curr.complete_hour), 0));
          this.previewSalary.unit_salary = Number(this.previewSalary.day_invoice?.reduce(
            (prev, curr) => prev + (curr.unit_pay * curr.complete_unit), 0));
          this.total = this.previewSalary.hour_salary + this.previewSalary.unit_salary;
        }
    );
    this.salaryGroup.valueChanges.subscribe(changes => {
      this.total = (this.previewSalary.hour_salary + this.previewSalary.unit_salary + changes.bonus - changes.deduction)
    })
  }

  onSalaryConfirm() {
    const hour_pay_subtotal = this.previewSalary.day_invoice?.reduce((prev, curr) => prev + (curr.hour_pay * curr.complete_hour), 0);
    const unit_pay_subtotal = this.previewSalary.day_invoice?.reduce((prev, curr) => prev + (curr.unit_pay * curr.complete_unit), 0);
    const new_salary: Salary = {
      ...this.previewSalary,
      hour_salary: Number(hour_pay_subtotal),
      unit_salary: Number(unit_pay_subtotal)};
    if (this.payNow) {
      new_salary.check_date = new Date();
    }
    console.log(new_salary);
    this.salaryService.postSalary(new_salary).subscribe(
      ret_salary => {
        new_salary.day_invoice?.forEach(di => {
          if (di.complete_unit || di.complete_hour) {
            di.check_status = true;
            di.check_date = new Date();
            di.salary_id = ret_salary.id;
            this.DIService.putDayInvoice(di).subscribe();
          }
        });
        this.payNow && this.employeeService.updateLastPayCheck(ret_salary.employee_id, ret_salary.check_date || new Date()).subscribe();
        this.dialogRef.close(ret_salary);
      },
      error => {
        console.log(error);
        this._snackBar.open(`薪水结算失败`, "关闭");
      }
    )
  }

  ifAllWorkValidated() {
    if (!this.previewSalary) {
      return false;
    } else {
      return this.previewSalary.day_invoice && this.previewSalary.day_invoice?.length > 0;
    }
  }

  updateSalaryData() {
    this.previewSalary.hour_salary = Number(this.previewSalary.day_invoice?.reduce(
      (prev, curr) => prev + (curr.hour_pay * curr.complete_hour), 0));
    this.previewSalary.unit_salary = Number(this.previewSalary.day_invoice?.reduce(
      (prev, curr) => prev + (curr.unit_pay * curr.complete_unit), 0));
    this.total = (this.previewSalary.hour_salary + this.previewSalary.unit_salary + Number(this.salaryGroup.controls['bonus'].value) - Number(this.salaryGroup.controls['deduction'].value))
  }
}
