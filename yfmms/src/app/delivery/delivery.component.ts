import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Delivery} from '../shared/models/delivery';
import {MatPaginator} from '@angular/material/paginator';
import {DeliveryService} from '../shared/services/delivery.service';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatTableDataSource} from '@angular/material/table';
import {environment} from '../../environments/environment';
import {CreateDeliveryDialogComponent} from './create-delivery-dialog/create-delivery-dialog.component';
import {ProductService} from '../shared/services/product.service';
import {JWTTokenService} from '../shared/services/jwt-token.service';

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.scss']
})
export class DeliveryComponent implements OnInit {
  displayedProperties: string[] = [
    'product_name', 'buyer_company', 'amount',
    'order_id', 'deliver_date',
    'unit_price', 'total_price', 'notice',
    'edit'
  ];
  displayedColumns = new Map([['product_name', '产品名称'], ['buyer_company','客户公司'], ['amount', '交付数量'],
    ['order_id', '客户订单号'], ['deliver_date', '交付日期'], ['unit_price', '单价'], ['total_price', '总价'], ['notice', '备注'], ['edit', '编辑']]);
  editableProperties: string[] = [
    'amount', 'order_id', 'deliver_date', 'unit_price', 'notice'
  ];

  searchKeyword = new FormControl('')
  deliveries: Delivery[] = [];
  dataSource: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    public jwtTokenService: JWTTokenService,
    private deliveryService: DeliveryService,
    private productService: ProductService,
    public dialog: MatDialog,
    public _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.deliveryService.getDeliveries().subscribe(
      res => {
        this.deliveries = res;
        this.deliveries.forEach(d => {
          this.productService.getProductNameById(d.product_id).subscribe(
            res => d.product_name = res.name);
          d.buyer_company = d.buyer?.company;
        });
        this.dataSource = new MatTableDataSource<Delivery>(this.deliveries);
        this.dataSource.paginator = this.paginator;
      },
      error => console.log(error)
    );
    this.searchKeyword.valueChanges.subscribe(
      kw => {
        this.dataSource = new MatTableDataSource<Delivery>(this.deliverySearchFilter(kw));
        this.dataSource.paginator = this.paginator;
      })
  }

  openCreateDeliveryDialog(): void {
    const dialogRef = this.dialog.open(CreateDeliveryDialogComponent, {
      width: environment.MEDIAN_DIALOG_WIDTH,
    });

    dialogRef.afterClosed().subscribe(new_delivery => {
      if (new_delivery) {
        this.onSuccess('创建新交付记录');
        this.deliveries.push(new_delivery);
        this.dataSource = new MatTableDataSource<Delivery>(this.deliveries);
      }
    });
  }

  deliverySearchFilter(keyword: string): Delivery[] {
    return keyword
      ? this.deliveries.filter(
        d => d.buyer?.name.includes(keyword) || d.buyer?.company.includes(keyword) || d.product_name?.includes(keyword))
      : this.deliveries
  }

  onDeliverySubmit(delivery: Delivery): void {
    this.deliveryService.putDelivery(delivery).subscribe(
      res => this.onSuccess('修改交付记录'),
      error => this.onFailure('修改交付记录')
    )
  }

  onSuccess(eventString: string): void {
    this._snackBar.open(`${eventString}成功`, "关闭");
  }

  onFailure(eventString: string): void {
    this._snackBar.open(`${eventString}失败`, "关闭");
  }

}
