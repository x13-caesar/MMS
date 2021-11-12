import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessCompleteDialogComponent } from './process-complete-dialog.component';

describe('ProcessCompleteDialogComponent', () => {
  let component: ProcessCompleteDialogComponent;
  let fixture: ComponentFixture<ProcessCompleteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessCompleteDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessCompleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
