import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import {Product} from '../shared/models/product';
import {ProductService} from '../shared/services/product.service';
import {Observable} from 'rxjs';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = [
    'id', 'name', 'category', 'description',
    'last_produce', 'inventory', 'picture', 'notice'
  ];

  products: Product[] = []
  dataSource: any

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.productService.getProducts().subscribe(
      res => {
        this.products = res;
        this.dataSource = new MatTableDataSource<Product>(res);
        this.dataSource.paginator = this.paginator;
      },
      error => console.log(error)
    )
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  // dataSource = new productDataSource(this.productService);

}

export class productDataSource extends DataSource<Product> {

  constructor(
    private productService: ProductService
  ) {
    super();
  }

  connect(): Observable<Product[]> {
    return this.productService.getProducts();
  }

  disconnect() {}
}
