import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Form, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Batch} from '../../shared/models/batch';
import {BatchService} from '../../shared/services/batch.service';
import {BatchProcess} from '../../shared/models/batch-process';
import {Work} from '../../shared/models/work';
import {WorkService} from '../../shared/services/work.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {BatchProcessService} from '../../shared/services/batch-process.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {DayInvoiceService} from '../../shared/services/day-invoice.service';
import {DayInvoice} from '../../shared/services/day-invoice';

class DialogData {
  workingBatches!: Batch[]
}

@Component({
  selector: 'app-add-day-invoice-dialog',
  templateUrl: './add-day-invoice-dialog.component.html',
  styleUrls: ['./add-day-invoice-dialog.component.scss']
})
export class AddDayInvoiceDialogComponent implements OnInit {
  selectedBatch = new FormControl(null);
  selectedBatchProcess = new FormControl(null);
  selectedWork = new FormControl(null);
  completeUnitCtrl = new FormControl(null);
  completeHourCtrl = new FormControl(null);

  workingBatches: Batch[] = []
  workingBatchOptions!: Observable<Batch[]>
  bpOptions!: Observable<BatchProcess[]>
  workOptions!: Observable<Work[]>
  calculateMethod: string = ''
  finishedBatchAddCtrl = new FormControl('', Validators.required);
  dateCtrl = new FormControl((new Date()), Validators.required);

  constructor(
    public dialogRef: MatDialogRef<AddDayInvoiceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private formBuilder: FormBuilder,
    public batchService: BatchService,
    public bpService: BatchProcessService,
    public workService: WorkService,
    public DIService: DayInvoiceService,
    public _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    if (this.data && this.data.workingBatches.length > 0) {
      this.workingBatches = this.data.workingBatches;
    } else {
      this.batchService.getWorkingBatches().subscribe(
        res => this.workingBatches = res
      );
    }
    this.workingBatchOptions = this.selectedBatch.valueChanges.pipe(
      map(input => this.batchService.batchAutocompleteFilter(this.workingBatches, input)));
    this.bpOptions = this.selectedBatchProcess.valueChanges.pipe(
      map(input => this.bpService.batchProcessAutocompleteFilter(this.selectedBatch.value.batch_process, input)));
    this.workOptions = this.selectedWork.valueChanges.pipe(
      map(input => this.workService.workAutocompleteFilter(this.selectedBatchProcess.value.work, input)));
  }

  onConfirmClick() {
    const new_day_invoice: DayInvoice = {
      process_name: this.selectedBatchProcess.value.process.process_name,
      batch_id: this.selectedBatch.value.id,
      check_status: false,
      complete_hour: 0,
      complete_unit: this.completeUnitCtrl.value,
      employee_name: this.selectedWork.value.employee_name,
      hour_pay: 0,
      unit_pay: 0,
      work_date: this.dateCtrl.value,
      employee_id: this.selectedWork.value.employee_id
    };
    if (this.selectedWork) {
      this.selectedWork.value.complete_unit += this.completeUnitCtrl.value;
      if (this.calculateMethod === 'unit') {
        this.selectedWork.value.unit_pay = this.selectedBatchProcess.value.unit_pay || this.selectedBatchProcess.value.process?.unit_pay || 1.5;
        new_day_invoice.unit_pay = this.selectedBatchProcess.value.unit_pay
      } else {
        this.selectedWork.value.complete_hour += this.completeHourCtrl.value;
        new_day_invoice.complete_hour = this.completeHourCtrl.value;
        new_day_invoice.hour_pay = this.selectedWork.value.hour_pay;
      }
      this.workService.putWork(this.selectedWork.value).subscribe(
        ret_work => {
          console.log(new_day_invoice);
          this.DIService.postDayInvoice(new_day_invoice).subscribe(
            ret_day_invoice => {
              this.completeHourCtrl.reset();
              this.completeUnitCtrl.reset();
              this.onSuccess('员工日产添加');
            }
          )
        },
        error => this.onFailure('员工日产添加')
      )
    }
  }

  onNoClick() {
    this.dialogRef.close();
  }

  onSuccess(eventString: string): void {
    this._snackBar.open(`${eventString}成功`, "关闭");
  }

  onFailure(eventString: string): void {
    this._snackBar.open(`${eventString}失败`, "关闭");
  }

  onBatchChange() {
    this.selectedBatchProcess.reset();
    this.selectedWork.reset();
  }

  onBatchProcessChange() {
    this.selectedWork.reset();
  }

  onFinishedBatchAdd(batch_id: number) {
    this.batchService.getBatch(batch_id).subscribe(
      res => {
        this.workingBatches.push(res);
        this.onSuccess('历史批次加入');
      },
      error => {
        this.onFailure('历史批次加入');
        console.log(error);
      }
    )
  }

}
