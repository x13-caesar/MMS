import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './header/header.component';
import {MatDividerModule} from '@angular/material/divider';
import { OverviewComponent } from './overview/overview.component';
import { TransmissionComponent } from './transmission/transmission.component';
import { ManufactureComponent } from './manufacture/manufacture.component';
import { InventoryComponent } from './inventory/inventory.component';
import { ProcessCompleteDialogComponent } from './manufacture/process-complete-dialog/process-complete-dialog.component';
import { BatchCompleteDialogComponent } from './manufacture/batch-complete-dialog/batch-complete-dialog.component';
import { CreateSpecComponent } from './create-spec/create-spec.component';
import { CreateProductComponent } from './create-product/create-product.component';
import { StockComponent } from './stock/stock.component';
import { PullInDialogComponent } from './stock/pull-in-dialog/pull-in-dialog.component';
import { LoginComponent } from './login/login.component';
import { AccountComponent } from './account/account.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CustomStyleModule} from './shared/custom-style.module';
import {HttpClientModule} from '@angular/common/http';
import { OperationComponent } from './operation/operation.component';
import { VendorListComponent } from './vendor-list/vendor-list.component';
import { CreateVendorDialogComponent } from './vendor-list/create-vendor-dialog/create-vendor-dialog.component';
import { CreateWorkDialogComponent } from './manufacture/create-work-dialog/create-work-dialog.component';
import { EditWorkDialogComponent } from './manufacture/edit-work-dialog/edit-work-dialog.component';
import { CompleteWorkDialogComponent } from './manufacture/complete-work-dialog/complete-work-dialog.component';
import { CreateBatchDialogComponent } from './manufacture/create-batch-dialog/create-batch-dialog.component';
import { HistoryComponent } from './manufacture/history/history.component';
import { EmployeeComponent } from './employee/employee.component';
import { EditComponentDialogComponent } from './stock/edit-component-dialog/edit-component-dialog.component';
import { DeleteComponentDialogComponent } from './stock/delete-component-dialog/delete-component-dialog.component';
import { EditSpecDialogComponent } from './stock/edit-spec-dialog/edit-spec-dialog.component';
import { CreateEmployeeDialogComponent } from './employee/create-employee-dialog/create-employee-dialog.component';
import { DeliveryComponent } from './delivery/delivery.component';
import { CreateDeliveryDialogComponent } from './delivery/create-delivery-dialog/create-delivery-dialog.component';
import { BuyerListComponent } from './buyer-list/buyer-list.component';
import { CreateBuyerDialogComponent } from './buyer-list/create-buyer-dialog/create-buyer-dialog.component';
import { EditProductDialogComponent } from './inventory/edit-product-dialog/edit-product-dialog.component';
import { SalaryComponent } from './salary/salary.component';
import { CreateSalaryForOneDialogComponent } from './salary/create-salary-for-one-dialog/create-salary-for-one-dialog.component';
import { AddDayInvoiceDialogComponent } from './manufacture/add-day-invoice-dialog/add-day-invoice-dialog.component';
import { CopyProductDialogComponent } from './inventory/copy-product-dialog/copy-product-dialog.component';
import { ConfirmDeprecateDialogComponent } from './inventory/confirm-deprecate-dialog/confirm-deprecate-dialog.component';
import { DeprecatedComponent } from './inventory/deprecated/deprecated.component';
import { BatchSummaryComponent } from './manufacture/batch-summary/batch-summary.component';
import { AddSpecDialogComponent } from './stock/add-spec-dialog/add-spec-dialog.component';
import { DayInvoiceListComponent } from './salary/day-invoice-list/day-invoice-list.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import { CancelBatchConfirmDialogComponent } from './manufacture/cancel-batch-confirm-dialog/cancel-batch-confirm-dialog.component';
import { ConfirmEmployeeLeaveDialogComponent } from './employee/confirm-employee-leave-dialog/confirm-employee-leave-dialog.component';
import { DeleteSpecConfirmDialogComponent } from './stock/delete-spec-confirm-dialog/delete-spec-confirm-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    OverviewComponent,
    TransmissionComponent,
    ManufactureComponent,
    InventoryComponent,
    ProcessCompleteDialogComponent,
    BatchCompleteDialogComponent,
    CreateSpecComponent,
    CreateProductComponent,
    StockComponent,
    PullInDialogComponent,
    LoginComponent,
    AccountComponent,
    OperationComponent,
    VendorListComponent,
    CreateVendorDialogComponent,
    CreateWorkDialogComponent,
    EditWorkDialogComponent,
    CompleteWorkDialogComponent,
    CreateBatchDialogComponent,
    HistoryComponent,
    EmployeeComponent,
    EditComponentDialogComponent,
    DeleteComponentDialogComponent,
    EditSpecDialogComponent,
    CreateEmployeeDialogComponent,
    DeliveryComponent,
    CreateDeliveryDialogComponent,
    BuyerListComponent,
    CreateBuyerDialogComponent,
    EditProductDialogComponent,
    SalaryComponent,
    CreateSalaryForOneDialogComponent,
    AddDayInvoiceDialogComponent,
    CopyProductDialogComponent,
    ConfirmDeprecateDialogComponent,
    DeprecatedComponent,
    BatchSummaryComponent,
    AddSpecDialogComponent,
    DayInvoiceListComponent,
    CancelBatchConfirmDialogComponent,
    ConfirmEmployeeLeaveDialogComponent,
    DeleteSpecConfirmDialogComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatDividerModule,
    ReactiveFormsModule,
    CustomStyleModule,
    FormsModule,
    MatTooltipModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
