import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Buyer} from '../shared/models/buyer';
import {MatPaginator} from '@angular/material/paginator';
import {BuyerService} from '../shared/services/buyer.service';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatTableDataSource} from '@angular/material/table';
import {environment} from '../../environments/environment';
import {CreateBuyerDialogComponent} from './create-buyer-dialog/create-buyer-dialog.component';

@Component({
  selector: 'app-buyer-list',
  templateUrl: './buyer-list.component.html',
  styleUrls: ['./buyer-list.component.scss']
})
export class BuyerListComponent implements OnInit {
  displayedColumns: string[] = [
    'name', 'company', 'payment_period',
    'contact', 'address', 'notice', 'edit'
  ];

  searchKeyword = new FormControl('')
  buyers: Buyer[] = [];
  dataSource: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private buyerService: BuyerService,
    public dialog: MatDialog,
    public _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.buyerService.getBuyers().subscribe(
      res => {
        this.buyers = res;
        this.dataSource = new MatTableDataSource<Buyer>(this.buyers);
        this.dataSource.paginator = this.paginator;
      },
      error => console.log(error)
    );
    this.searchKeyword.valueChanges.subscribe(
      kw => {
        this.dataSource = new MatTableDataSource<Buyer>(this.buyerSearchFilter(kw));
        this.dataSource.paginator = this.paginator;
      })
  }

  openCreateBuyerDialog(): void {
    const dialogRef = this.dialog.open(CreateBuyerDialogComponent, {
      width: environment.MEDIAN_DIALOG_WIDTH
    });

    dialogRef.afterClosed().subscribe(new_buyer => {
      this.buyers.push(new_buyer);
      this.dataSource = new MatTableDataSource<Buyer>(this.buyers);
    });
  }

  buyerSearchFilter(keyword: string): Buyer[] {
    return keyword
      ? this.buyers.filter(
        buyer => buyer.company.includes(keyword) || buyer.name.includes(keyword) || (buyer.notice && buyer.notice.includes(keyword)))
      : this.buyers
  }

  onBuyerSubmit(buyer: Buyer): void {
    this.buyerService.putBuyer(buyer).subscribe(
      res => this.onSuccess('修改供应商'),
      error => this.onFailure('修改供应商')
    )
  }

  onBuyerDelete(buyer: Buyer): void {
    this.buyerService.deleteBuyer(Number(buyer.id)).subscribe(
      res => {
        const target = this.buyers.findIndex(v => v.id === buyer.id);
        if (target > -1) {
          this.buyers.splice(target, 1);
          this.dataSource = new MatTableDataSource<Buyer>(this.buyers);
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