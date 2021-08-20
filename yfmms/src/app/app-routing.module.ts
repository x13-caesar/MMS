import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {OverviewComponent} from './overview/overview.component';
import {InventoryComponent} from './inventory/inventory.component';
import {StockComponent} from './stock/stock.component';
import {ManufactureComponent} from './manufacture/manufacture.component';
import {HrComponent} from './hr/hr.component';
import {AuthorizeGuard} from './auth.guard';
import {AppComponent} from './app.component';
import {LoginComponent} from './login/login.component';
import {CreateProductComponent} from './create-product/create-product.component';
import {CreateEmployeeComponent} from './create-employee/create-employee.component';
import {CreateSpecComponent} from './create-spec/create-spec.component';
import {TransmissionComponent} from './transmission/transmission.component';
import {VendorListComponent} from './vendor-list/vendor-list.component';
import {HistoryComponent} from './manufacture/history/history.component';
import {EmployeeComponent} from './employee/employee.component';

const routes: Routes = [
  {
    path: 'app',
    component: AppComponent,
    canActivate: [AuthorizeGuard]
  },
  {
    path: 'overview',
    component: OverviewComponent
  },
  {
    path: 'inventory',
    component: InventoryComponent
  },
  {
    path: 'stock',
    component: StockComponent
  },
  {
    path: 'manufacture',
    component: ManufactureComponent
  },
  {
    path: 'history',
    component: HistoryComponent
  },
  {
    path: 'employee',
    component: EmployeeComponent
  },
  {
    path: 'hr',
    component: HrComponent
  },
  {
    path: 'vendors',
    component: VendorListComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'create-product',
    component: CreateProductComponent
  },
  {
    path: 'create-employee',
    component: CreateEmployeeComponent
  },
  {
    path: 'create-spec',
    component: CreateSpecComponent
  },
  {
    path: 'transmission/:error',
    component: TransmissionComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
