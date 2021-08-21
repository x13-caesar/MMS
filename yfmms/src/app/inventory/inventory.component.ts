import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import {Product} from '../shared/models/product';
import {ProductService} from '../shared/services/product.service';
import {Observable} from 'rxjs';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {MatDialog} from '@angular/material/dialog';
import {CreateWorkDialogComponent} from '../manufacture/create-work-dialog/create-work-dialog.component';
import {environment} from '../../environments/environment';
import {CreateDeliveryDialogComponent} from '../delivery/create-delivery-dialog/create-delivery-dialog.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {Compo} from '../shared/models/compo';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit {

  displayedColumns: string[] = [
    'id', 'name', 'category', 'description',
    'last_produce', 'inventory', 'picture', 'notice',
    'edit', 'delivery'
  ];

  products: Product[] = []
  displayProducts: Product[] = []
  dataSource: any

  filterGroup!: FormGroup;
  categories: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private productService: ProductService,
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    public _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.productService.getProducts().subscribe(
      res => {
        this.products = res;
        this.displayProducts = this.products;
        this.categories = res.map(prod => prod.category).filter((v, idx, arr) => !!v && arr.indexOf(v) === idx);
        this.dataSource = new MatTableDataSource<Product>(this.displayProducts);
        this.dataSource.paginator = this.paginator;
      },
      error => console.log(error)
    )
    this.filterGroup = this.formBuilder.group({
      keyword: new FormControl(''),
      material: new FormControl(null),
      category: new FormControl(null)
    })
    this.filterGroup.valueChanges.subscribe(
      changes => {
        this.displayProducts = this.productSearchFilter(changes)
        this.dataSource = new MatTableDataSource<Product>(this.displayProducts);
      }
    )
  }

  productSearchFilter(changes: any): Product[] {
    return this.products
      .filter(prod => !changes.category || (prod.category === changes.category))
      .filter(prod => String(prod.id).includes(changes.keyword)
        || prod.name.includes(changes.keyword)
        || prod.description?.includes(changes.keyword)
        || (prod.notice && prod.notice.includes(changes.keyword)))
  }


  emptyFilter(): void {
    this.filterGroup.reset()
    this.displayProducts = this.products;
    this.dataSource = new MatTableDataSource<Product>(this.displayProducts);
  }

  openCreateDeliveryDialog(product: Product) {
    const dialogRef = this.dialog.open(CreateDeliveryDialogComponent, {
      width: environment.SMALL_DIALOG_WIDTH,
      data: {product: product}
    });

    dialogRef.afterClosed().subscribe(
      new_delivery => new_delivery && this.onSuccess('新增交付记录')
    );
  }

  openEditProductDialog(product: Product) {

  }

  onSuccess(eventString: string): void {
    this._snackBar.open(`${eventString}成功`, "关闭");
  }
}
