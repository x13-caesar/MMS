import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Batch} from '../../shared/models/batch';
import {ProductService} from '../../shared/services/product.service';
import {Product} from '../../shared/models/product';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {BatchService} from '../../shared/services/batch.service';
import {BatchProcessService} from '../../shared/services/batch-process.service';
import {ProcessService} from '../../shared/services/process.service';
import {Process} from '../../shared/models/process';
import {BatchProcess} from '../../shared/models/batch-process';

class DialogData {
}

@Component({
  selector: 'app-create-batch-dialog',
  templateUrl: './create-batch-dialog.component.html',
  styleUrls: ['./create-batch-dialog.component.scss']
})
export class CreateBatchDialogComponent implements OnInit {
  batchGroup!: FormGroup;
  products: Product[] = [];
  productOptions!: Observable<Product[]>;
  returnBatch: Batch | null = null;

  constructor(
    public dialogRef: MatDialogRef<CreateBatchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private batchService: BatchService,
    private bpService: BatchProcessService,
    private processService: ProcessService,
    public _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.productService.getValidProducts().subscribe(
      res => this.products = res,
      error => console.log(error))
    this.batchGroup = this.formBuilder.group({
      product_id: new FormControl(null, Validators.required),
      plan_amount: new FormControl(null, [Validators.required, Validators.min(1)]),
      start: new FormControl('', Validators.required),
      notice: new FormControl('')
    })
    this.productOptions = this.batchGroup.controls['product_id'].valueChanges.pipe(
      map(input => this.productAutocompleteFilter(input)));
  }

  productAutocompleteFilter(input: string): Product[] {
    return this.products.filter(p => p.name.includes(input) || String(p.id).startsWith(input))
  }

  productDisplayFn(product: Product): string {
    return product ? `${product.name} | ${product.id}` : ''
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onBatchSubmit(form: FormGroup): void {
    const now = new Date();
    const product_name = form.value.product_id.name;
    const new_batch: Batch = {...form.value, product_id: form.value.product_id.id};
    new_batch.create = now;
    new_batch.status = new_batch.start > now ? 'unstarted' : 'ongoing'
    this.batchService.postBatch(new_batch).subscribe(
      returnBatch => {
        this.returnBatch = {...returnBatch, batch_process: this.bpService.postBatchProcessesByBatch(returnBatch), product_name: product_name};
        this.dialogRef.close(this.returnBatch);
      },
      error => {
        console.log(error);
        this.onFailure('创建生产批次');
      }
    )
  }

  onSuccess(eventString: string): void {
    this._snackBar.open(`${eventString}成功`, "关闭");
  }

  onFailure(eventString: string): void {
    this._snackBar.open(`${eventString}失败`, "关闭");
  }

}
