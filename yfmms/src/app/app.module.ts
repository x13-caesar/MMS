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
import { HrComponent } from './hr/hr.component';
import { ProcessCompleteDialogComponent } from './manufacture/process-complete-dialog/process-complete-dialog.component';
import { BatchCompleteDialogComponent } from './manufacture/batch-complete-dialog/batch-complete-dialog.component';
import { CreateSpecComponent } from './create-spec/create-spec.component';
import { CreateProductComponent } from './create-product/create-product.component';
import { CreateEmployeeComponent } from './create-employee/create-employee.component';
import { WorkRecordDialogComponent } from './hr/work-record-dialog/work-record-dialog.component';
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

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    OverviewComponent,
    TransmissionComponent,
    ManufactureComponent,
    InventoryComponent,
    HrComponent,
    ProcessCompleteDialogComponent,
    BatchCompleteDialogComponent,
    CreateSpecComponent,
    CreateProductComponent,
    CreateEmployeeComponent,
    WorkRecordDialogComponent,
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
    CreateEmployeeDialogComponent
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
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
