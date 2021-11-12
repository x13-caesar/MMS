import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteSpecConfirmDialogComponent } from './delete-spec-confirm-dialog.component';

describe('DeleteSpecConfirmDialogComponent', () => {
  let component: DeleteSpecConfirmDialogComponent;
  let fixture: ComponentFixture<DeleteSpecConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteSpecConfirmDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteSpecConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
