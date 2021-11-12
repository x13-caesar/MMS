import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDayInvoiceDialogComponent } from './add-day-invoice-dialog.component';

describe('AddDayInvoiceDialogComponent', () => {
  let component: AddDayInvoiceDialogComponent;
  let fixture: ComponentFixture<AddDayInvoiceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddDayInvoiceDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDayInvoiceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
