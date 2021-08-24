import {Component, Inject, OnInit} from '@angular/core';
import {Work} from '../../shared/models/work';
import {BatchProcess} from '../../shared/models/batch-process';
import {Batch} from '../../shared/models/batch';
import {Observable} from 'rxjs';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {WorkService} from '../../shared/services/work.service';
import {WorkSpecificationService} from '../../shared/services/work-specification.service';
import {SpecService} from '../../shared/services/spec.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {map} from 'rxjs/operators';
import {WorkSpecification} from '../../shared/models/work-specification';
import {Delivery} from '../../shared/models/delivery';
import {BatchService} from '../../shared/services/batch.service';
import {Product} from '../../shared/models/product';
import {ProductService} from '../../shared/services/product.service';
import {Buyer} from '../../shared/models/buyer';
import {DeliveryService} from '../../shared/services/delivery.service';
import {BuyerService} from '../../shared/services/buyer.service';

class DialogData {
  product!: Product
}

@Component({
  selector: 'app-create-delivery-dialog',
  templateUrl: './create-delivery-dialog.component.html',
  styleUrls: ['./create-delivery-dialog.component.scss']
})
export class CreateDeliveryDialogComponent implements OnInit {
  buyers: Buyer[] = [];
  buyerOptions!: Observable<Buyer[]>;

  products: Product[] = [];
  productOptions!: Observable<Product[]>;

  deliveryGroup = new FormGroup({});
  total_price =  new FormControl(0, Validators.required);

  constructor(
    public dialogRef: MatDialogRef<CreateDeliveryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private formBuilder: FormBuilder,
    private deliveryService: DeliveryService,
    private buyerService: BuyerService,
    public productService: ProductService,
    public _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.deliveryGroup = this.formBuilder.group({
      product_id: new FormControl(this.data ? this.data.product : null, Validators.required),
      amount: new FormControl(0,
        [Validators.required, Validators.min(0), Validators.max(this.deliveryGroup.controls['product_id'].value.inventory || 0)]),
      order_id: new FormControl(''),
      buyer_id: new FormControl('', Validators.required),
      deliver_date: new FormControl(new Date(), Validators.required),
      unit_price: new FormControl(0, [Validators.required, Validators.min(0)]),
      notice: new FormControl('')
    });
    if (!this.data.product) {
      this.productService.getProducts().subscribe(
        res => this.products = res
      )
    };
    this.buyerService.getBuyers().subscribe(
      res => this.buyers = res,
      error => console.log(error)
    );
    this.deliveryGroup.controls['product_id'].setValue(this.data.product.id);
    // this.deliveryGroup.controls['product_id'].disable();
    this.productOptions = this.deliveryGroup.controls['product_id'].valueChanges.pipe(
      map(input => this.productService.productAutocompleteFilter(input, this.products)));
    this.buyerOptions = this.deliveryGroup.controls['buyer_id'].valueChanges.pipe(
      map(input => this.buyerAutocompleteFilter(input)));
    this.deliveryGroup.valueChanges.subscribe(
      changes => this.total_price.setValue(changes['unit_price'] * changes['amount'])
    );
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  buyerAutocompleteFilter(value: string): Buyer[] {
    return this.buyers.filter(b => b.company.includes(value) || b.name.includes(value));
  }

  buyerDisplayFn(b: Buyer): string {
    return b && `${b.company} | ${b.name}`;
  }

  onDeliveryConfirm(form: FormGroup): void {
    const new_delivery = {...form.value, buyer_id: form.value.buyer_id.id, total_price: this.total_price.value};
    new_delivery.product_id = new_delivery.product_id.id;
    this.deliveryService.postDelivery(new_delivery).subscribe(
      res => {
        this.productService.adjustProductInventory(res.product_id, (0-res.amount)).subscribe(
          ret_prod => this.dialogRef.close(res),
          ret_error => this.onFailure()
        );
      },
      error => this.onFailure()
    )
  }

  onSuccess(): void {
    this._snackBar.open(`创建成功`, "关闭");
  }

  onFailure(): void {
    this._snackBar.open(`创建失败`, "关闭");
  }

}
