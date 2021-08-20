import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Batch} from '../shared/models/batch';
import {BatchService} from '../shared/services/batch.service';
import {MatListOption} from '@angular/material/list';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BatchProcess} from '../shared/models/batch-process';
import {Employee} from '../shared/models/employee';
import {EmployeeService} from '../shared/services/employee.service';
import {MatDialog} from '@angular/material/dialog';
import {CreateWorkDialogComponent} from './create-work-dialog/create-work-dialog.component';
import {environment} from '../../environments/environment';
import {ProductService} from '../shared/services/product.service';
import {WorkService} from '../shared/services/work.service';
import {Work} from '../shared/models/work';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CompleteWorkDialogComponent} from './complete-work-dialog/complete-work-dialog.component';
import {EditWorkDialogComponent} from './edit-work-dialog/edit-work-dialog.component';
import {WarehouseRecord} from '../shared/models/warehouse-record';
import {BatchProcessService} from '../shared/services/batch-process.service';
import {CreateBatchDialogComponent} from './create-batch-dialog/create-batch-dialog.component';
import {WarehouseRecordService} from '../shared/services/warehouse-record.service';
import {CompoService} from '../shared/services/compo.service';
import {UtilService} from '../shared/util.service';
import {SpecService} from '../shared/services/spec.service';

@Component({
  selector: 'app-manufacture',
  templateUrl: './manufacture.component.html',
  styleUrls: ['./manufacture.component.scss']
})
export class ManufactureComponent implements OnInit {

  displayedBatches: Batch[] = []
  selectedBatch!: Batch;
  selectedBatchProcess!: BatchProcess;

  step = 1;

  specChoiceGroup!: FormGroup;
  workingEmployees: Employee[] = [];

  constructor(
    private batchService: BatchService,
    private formBuilder: FormBuilder,
    private employeeService: EmployeeService,
    private productService: ProductService,
    public dialog: MatDialog,
    private workService: WorkService,
    private _snackBar: MatSnackBar,
    private specService: SpecService,
    private bpService: BatchProcessService,
    private wrService: WarehouseRecordService,
    private compoService: CompoService,
    private util: UtilService
  ) { }

  ngOnInit(): void {
    this.batchService.getUnfinishedBatches().subscribe(
      res => {
        this.displayedBatches = res;
        this.displayedBatches.forEach(b => {
          this.productService.getProductNameById(b.product_id).subscribe(
            res => b.product_name = res.name,
            error => console.log(error)
          );
        })
      },
      error => console.log(error)
    );
    this.employeeService.getEmployeesByStatus('working').subscribe(
      res => this.workingEmployees = res,
      error => console.log(error)
    );
    this.specChoiceGroup = this.formBuilder.group({});
  }

  onBatchChange(options: MatListOption[]) {
    // map these MatListOptions to their values
    this.selectedBatch = options[0].value;
    this.step = this.selectedBatch.batch_process.find(bp => bp.status === 'ongoing')?.process?.process_order || 1;
    this.specChoiceGroup = new FormGroup({});
  }

  updateSpecChoiceGroup(bp: BatchProcess): void {
    // this.selectedBatchProcess = bp;
    this.specChoiceGroup = this.formBuilder.group({});
    bp.process?.process_component.forEach(
      pc => {
        this.specChoiceGroup.addControl(pc.component_id, this.formBuilder.control('', Validators.required));
      }
    );
    if (bp.warehouse_record && bp.warehouse_record.length > 0) {
      bp.warehouse_record.forEach(wr => {
        const compo_id = wr.component_id;
        const spec_id = wr.specification_id;
        const selectedSpec = bp.process?.process_component.find(pc => pc.component_id === compo_id)?.component?.specification?.find(spec => spec.id === spec_id)
        this.specChoiceGroup.controls[compo_id].setValue(selectedSpec);
      });
      this.specChoiceGroup.disable();
    } else {
      this.specChoiceGroup.enable();
    }
  }

  onConfirmSpecs(bp: BatchProcess): void {
    bp.process?.process_component.forEach(pc => {
      const wr: WarehouseRecord = {
        batch_process_id: Number(bp.id),
        component_id: pc.component_id,
        component_name: pc.component?.name || '',
        consumption: pc.consumption || 1,
        specification_id: this.specChoiceGroup.controls[pc.component_id].value.id
      };
      this.wrService.postWarehouseRecord(wr).subscribe(
        res => bp.warehouse_record?.push(res),
        error => {
          console.log(error);
          this.onFailure('确认领料规格')
        }
      )
    });
    this.onSuccess('确认领料规格');
    this.specChoiceGroup.disable();
  }

  onEditSpecs(bp: BatchProcess): void {
    const new_wr_array: WarehouseRecord[] = [];
    bp.warehouse_record?.forEach(wr => {
      wr.specification_id = this.specChoiceGroup.controls[wr.component_id].value.id;
      this.wrService.putWarehouseRecord(wr).subscribe(
        res => new_wr_array.push(res),
        error => {
          console.log(error);
          this.onFailure('修改领料规格')
        }
      )
    });
    bp.warehouse_record = new_wr_array;
    this.rerenderBatch(bp.batch_id);
    this.onSuccess('修改领料规格');
    this.specChoiceGroup.disable();
  }

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  openCreateWorkDialog(bp: BatchProcess): void {
    const dialogRef = this.dialog.open(CreateWorkDialogComponent, {
      width: environment.MEDIAN_DIALOG_WIDTH,
      data: {bp: bp, employees: this.workingEmployees}
    });

    dialogRef.afterClosed().subscribe(
      new_work => {
        this.rerenderBatch(bp.batch_id);
      }
    );
  }

  openEditWorkDialog(work: Work, wr_array: WarehouseRecord[], unit_limit: number): void {
    const specWithdrawsBefore = new Map();
    work.work_specification?.forEach(
      ws => specWithdrawsBefore.set(ws.specification_id, ws.actual_amount))
    const dialogRef = this.dialog.open(EditWorkDialogComponent, {
      width: environment.MEDIAN_DIALOG_WIDTH,
      data: {work: work, warehouse_record: wr_array, max_amount: unit_limit}
    });

    dialogRef.afterClosed().subscribe(
      updated_work => updated_work && this.workService.putWork(updated_work).subscribe(
        res => {
          res.work_specification?.forEach(nws => {
            const adjust_number = specWithdrawsBefore.get(nws.specification_id) - Number(nws.actual_amount);
            this.specService.adjustSpecStock(nws.specification_id, adjust_number).subscribe();
          });
          this.rerenderBatch(Number(this.selectedBatch.id));
          this.onSuccess('修改工人领料');
        },
        error => {
          this.onFailure('修改工人领料');
          console.log(error);
        }));
  }

  openCompleteWorkDialog(work: Work): void {
    const dialogRef = this.dialog.open(CompleteWorkDialogComponent, {
      width: environment.MEDIAN_DIALOG_WIDTH,
      data: {work: work}
    });

    dialogRef.afterClosed().subscribe(
      updated_work => this.workService.putWork(updated_work).subscribe(
        res => {
          this.rerenderBatch(Number(this.selectedBatch.id));
          this.onSuccess('确认完成');
        },
        error => {
          console.log(error);
          this.onFailure('确认完成');
          return work;
        }) && updated_work
    );
  }

  openCreateBatchDialog(): void {
    const dialogRef = this.dialog.open(CreateBatchDialogComponent, {
      width: environment.MEDIAN_DIALOG_WIDTH
    });
    dialogRef.afterClosed().subscribe(
      new_batch => {
        this.displayedBatches.push(new_batch);
        this.onSuccess('创建生产批次');
      }
    )
  }

  onSuccess(eventString: string): void {
    this._snackBar.open(`${eventString}成功`, "关闭");
  }

  onFailure(eventString: string): void {
    this._snackBar.open(`${eventString}失败`, "关闭");
  }

  checkAllWorkDone(works: Work[]): boolean {
    return !!works.length && works.every(w => w.complete_unit && w.complete_unit > 0)
  }

  checkAllBatchProcessDone(bps: BatchProcess[]): boolean {
    return bps.every(bp => bp.status === 'finished');
  }

  completeBatchProcess(bp: BatchProcess): void {
    const complete_bp = {...bp}
    // @ts-ignore
    complete_bp.end_amount = complete_bp.work?.reduce((acc, w) => {
      return acc + Number(w.complete_unit);
    }, 0);
    complete_bp.status = 'finished';
    this.bpService.putBatchProcess(complete_bp).subscribe(
      res => {
        this.rerenderBatch(complete_bp.batch_id);
        this.onSuccess('修改工艺状态');
      },
      error => {
        this.onFailure('修改工艺状态');
        console.log(error)
      }
    )
  }

  completeBatch(batch: Batch): void {
    const updated_batch = {...batch}
    updated_batch.actual_amount = batch.batch_process[batch.batch_process.length - 1].end_amount
    updated_batch.status = 'finished';
    updated_batch.end = this.util.mysqlDatetimeTransformer(new Date());
    this.batchService.putBatch(updated_batch).subscribe(
      res => {
        this.productService.adjustProductInventory(batch.product_id, Number(batch.actual_amount)).subscribe()
        this.onSuccess(`批次${res.id}完工确认`);
      },
      error => {
        this.onFailure(`批次${batch.id}完工确认`);
        console.log(error)
      }
    )
  }

  startBatchProcess(bp: BatchProcess, batch: Batch): void {
    const updated_bp = {...bp}
    updated_bp.status = 'ongoing';
    const current_order = updated_bp.process?.process_order;
    if (current_order === 1) {
      updated_bp.start_amount = batch.plan_amount;
    } else {
      updated_bp.start_amount = batch.batch_process.find(bp => bp.process?.process_order === (Number(current_order) - 1))?.end_amount;
    }
    this.bpService.putBatchProcess(updated_bp).subscribe(
      res => {
        this.rerenderBatch(Number(this.selectedBatch.id));
        this.onSuccess('修改工艺状态');
      },
      error => {
        this.onFailure('修改工艺状态');
        console.log(error)
      }
    )
  }

  rerenderBatch(batch_id: number): void {
    this.batchService.getBatch(Number(batch_id)).subscribe(
      updated_batch => {
        const target_idx = this.displayedBatches.findIndex(b => b.id === batch_id);
        this.displayedBatches[target_idx] = {...this.displayedBatches[target_idx], ...updated_batch};
        this.selectedBatch = this.displayedBatches[target_idx];
      }
    )
  }

  sortedBatchProcesses(bp_array: BatchProcess[]): BatchProcess[] {
    return bp_array.sort((a, b) => (Number(a.process?.process_order) - Number(b.process?.process_order)))
  }

}
