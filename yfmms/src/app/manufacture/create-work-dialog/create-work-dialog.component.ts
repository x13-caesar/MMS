import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Work} from '../../shared/models/work';
import {BatchProcess} from '../../shared/models/batch-process';
import {Employee} from '../../shared/models/employee';
import {Observable} from 'rxjs';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {map} from 'rxjs/operators';
import {Compo} from '../../shared/models/compo';
import {WorkSpecification} from '../../shared/models/work-specification';
import {WorkService} from '../../shared/services/work.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {WorkSpecificationService} from '../../shared/services/work-specification.service';
import {SpecService} from '../../shared/services/spec.service';
import {EmployeeService} from '../../shared/services/employee.service';

class DialogData {
  bp!: BatchProcess;
  employees!: Employee[];
  product_name!: string;
}

@Component({
  selector: 'app-create-work-dialog',
  templateUrl: './create-work-dialog.component.html',
  styleUrls: ['./create-work-dialog.component.scss']
})
export class CreateWorkDialogComponent implements OnInit {
  new_work!: Work;
  batchProcess!: BatchProcess;

  employees: Employee[] = [];
  employeeOptions!: Observable<Employee[]>;
  selectedEmployee = new FormControl('');

  workSpecGroup = new FormGroup({});
  work_date = new FormControl(new Date(), Validators.required);
  plan_unit = new FormControl(
    '',
    [Validators.required, Validators.max(this.data.bp.start_amount ?? 1000), Validators.min(1)]
  )

  constructor(
    public dialogRef: MatDialogRef<CreateWorkDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private formBuilder: FormBuilder,
    private workService: WorkService,
    public employeeService: EmployeeService,
    private wsService: WorkSpecificationService,
    private specService: SpecService,
    public _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.batchProcess = this.data.bp;
    this.employees = this.data.employees;
    this.employeeOptions = this.selectedEmployee.valueChanges.pipe(
      map(name => this.employeeAutocompleteFilter(name)));
    this.batchProcess.warehouse_record?.forEach(
      wr => this.workSpecGroup.addControl(
        wr.specification_id,
        this.formBuilder.control(
          '',
          [Validators.required, Validators.min(0)]
        )
      )
    );
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  employeeAutocompleteFilter(value: string): Employee[] {
    return this.employees.filter(e => e.name.includes(value));
  }

  onWorkConfirm(): void {
    const work_specification_array: WorkSpecification[] = [];
    this.new_work = {
      complete_hour: 0, complete_unit: 0, hour_pay: 0, unit_pay: 0,
      batch_process_id: this.batchProcess.id || 0,
      employee_id: this.selectedEmployee.value.id,
      employee_name: this.selectedEmployee.value.name,
      product_name: this.data.product_name,
      process_name: this.batchProcess.process?.process_name || '',
      work_date: this.work_date.value,
      plan_unit: this.plan_unit.value,
      check: false
    }
    this.workService.postWork(this.new_work).subscribe(
      res_work => {
        this.batchProcess.warehouse_record?.forEach(
          wr => {
            const ws: WorkSpecification = {
              work_id: res_work.id,
              specification_id: wr.specification_id,
              plan_amount: this.plan_unit.value * wr.consumption,
              actual_amount: this.workSpecGroup.controls[wr.specification_id].value
            }
            this.wsService.postWorkSpecification(ws).subscribe(
              res_ws => {
                work_specification_array.push(res_ws);
                this.specService.adjustSpecStock(res_ws.specification_id, 0-Number(res_ws.actual_amount)).subscribe();
              }
            )
          }
        );
        this.dialogRef.close({...this.new_work, work_specification: work_specification_array});
      },
      error => {
        console.log(error);
        this.onFailure();
      }
    )
  }

  onSuccess(): void {
    this._snackBar.open(`创建成功`, "关闭");
  }

  onFailure(): void {
    this._snackBar.open(`创建失败`, "关闭");
  }

}
