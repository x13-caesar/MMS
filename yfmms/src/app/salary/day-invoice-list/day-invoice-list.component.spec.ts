import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayInvoiceListComponent } from './day-invoice-list.component';

describe('DayInvoiceListComponent', () => {
  let component: DayInvoiceListComponent;
  let fixture: ComponentFixture<DayInvoiceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DayInvoiceListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DayInvoiceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
