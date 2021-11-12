import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatPaginator} from '@angular/material/paginator';
import {JWTTokenService} from '../../shared/services/jwt-token.service';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatTableDataSource} from '@angular/material/table';
import {environment} from '../../../environments/environment';
import {DayInvoiceService} from '../../shared/services/day-invoice.service';
import {DayInvoice} from '../../shared/services/day-invoice';
import {AddDayInvoiceDialogComponent} from '../../manufacture/add-day-invoice-dialog/add-day-invoice-dialog.component';

@Component({
  selector: 'app-day-invoice-list',
  templateUrl: './day-invoice-list.component.html',
  styleUrls: ['./day-invoice-list.component.scss']
})
export class DayInvoiceListComponent implements OnInit {
  displayedProperties: string[] = [
    'batch_id', 'process_name', 'employee_name', 'employee_id', 'work_date',
    'unit_pay', 'complete_unit', 'hour_pay', 'complete_hour',
    'check_status', 'check_date'
  ];

  displayedColumns = new Map([['batch_id','批次编号'], ['process_name', '工艺名称'],
    ['employee_id', '工号'], ['employee_name', '员工名称'], ['work_date', '日期'],
    ['unit_pay', '单位酬劳'], ['complete_unit', '完成数量'], ['hour_pay', '小时酬劳'], ['complete_hour', '工作小时'],
    ['check_status', '结算状态'], ['check_date', '结算日期']]);

  searchKeyword = new FormControl('')
  dayInvoices: DayInvoice[] = [];
  dataSource: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    public jwtTokenService: JWTTokenService,
    private dialog: MatDialog,
    private DIService: DayInvoiceService,
    public _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.DIService.getDayInvoices().subscribe(
      res => {
        this.dayInvoices = res;
        this.dataSource = new MatTableDataSource<DayInvoice>(this.dayInvoices);
        this.dataSource.paginator = this.paginator;
      },
      error => console.log(error)
    );
    this.searchKeyword.valueChanges.subscribe(
      kw => {
        this.dataSource = new MatTableDataSource<DayInvoice>(this.DIService.dayInvoiceSearchFilter(this.dayInvoices, kw));
        this.dataSource.paginator = this.paginator;
      })
  }

  openAddDayInvoiceDialog(): void {
    const dialogRef = this.dialog.open(AddDayInvoiceDialogComponent, {
      width: environment.MEDIAN_DIALOG_WIDTH,
    });
    dialogRef.afterClosed().subscribe(
    );
  }

  onSuccess(eventString: string): void {
    this._snackBar.open(`${eventString}成功`, "关闭");
  }

  onFailure(eventString: string): void {
    this._snackBar.open(`${eventString}失败`, "关闭");
  }

}
