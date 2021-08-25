import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {Product} from '../shared/models/product';
import {Vendor} from '../shared/models/vendor';
import {VendorService} from '../shared/services/vendor.service';
import {MatTableDataSource} from '@angular/material/table';
import {MatDialog} from '@angular/material/dialog';
import {CreateVendorDialogComponent} from './create-vendor-dialog/create-vendor-dialog.component';
import {environment} from '../../environments/environment';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {FormControl} from '@angular/forms';
import {JWTTokenService} from '../shared/services/jwt-token.service';

@Component({
  selector: 'app-vendor-list',
  templateUrl: './vendor-list.component.html',
  styleUrls: ['./vendor-list.component.scss']
})
export class VendorListComponent implements OnInit {
  displayedColumns: string[] = [
    'id', 'name', 'company', 'payment_period',
    'contact', 'address', 'notice', 'edit', 'delete'
  ];

  searchKeyword = new FormControl('')
  vendors: Vendor[] = [];
  dataSource: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    public jwtTokenService: JWTTokenService,
    private vendorService: VendorService,
    public dialog: MatDialog,
    public _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.vendorService.getVendors().subscribe(
      res => {
        this.vendors = res;
        this.dataSource = new MatTableDataSource<Vendor>(this.vendors);
        this.dataSource.paginator = this.paginator;
      },
      error => console.log(error)
    );
    this.searchKeyword.valueChanges.subscribe(
      kw => {
        this.dataSource = new MatTableDataSource<Vendor>(this.vendorSearchFilter(kw));
        this.dataSource.paginator = this.paginator;
      })
  }

  openCreateVendorDialog(): void {
    const dialogRef = this.dialog.open(CreateVendorDialogComponent, {
      width: environment.MEDIAN_DIALOG_WIDTH
    });

    dialogRef.afterClosed().subscribe(new_vendor => {
      if (new_vendor) {
        this.vendors.push(new_vendor);
        this.dataSource = new MatTableDataSource<Vendor>(this.vendors);
      }
    });
  }

  vendorSearchFilter(keyword: string): Vendor[] {
    return keyword
      ? this.vendors.filter(
        vendor => vendor.company.includes(keyword) || vendor.name.includes(keyword) || (vendor.notice && vendor.notice.includes(keyword)))
      : this.vendors
  }

  onVendorSubmit(vendor: Vendor): void {
    this.vendorService.putVendor(vendor).subscribe(
      res => this.onSuccess('修改供应商'),
      error => this.onFailure('修改供应商')
    )
  }

  onVendorDelete(vendor: Vendor): void {
    this.vendorService.deleteVendor(Number(vendor.id)).subscribe(
      res => {
        const target = this.vendors.findIndex(v => v.id === vendor.id);
        if (target > -1) {
          this.vendors.splice(target, 1);
          this.dataSource = new MatTableDataSource<Vendor>(this.vendors);
        }
        this.onSuccess('删除供应商');
      },
      error => this.onFailure('删除供应商')
    )
  }

  onSuccess(eventString: string): void {
    this._snackBar.open(`${eventString}成功`, "关闭");
  }

  onFailure(eventString: string): void {
    this._snackBar.open(`${eventString}失败`, "关闭");
  }

}
