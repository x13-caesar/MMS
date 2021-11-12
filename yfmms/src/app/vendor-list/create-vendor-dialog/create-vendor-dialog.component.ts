import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {VendorService} from '../../shared/services/vendor.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Vendor} from '../../shared/models/vendor';

@Component({
  selector: 'app-create-vendor-dialog',
  templateUrl: './create-vendor-dialog.component.html',
  styleUrls: ['./create-vendor-dialog.component.scss']
})
export class CreateVendorDialogComponent implements OnInit {

  vendorGroup!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CreateVendorDialogComponent>,
    private formBuilder: FormBuilder,
    private vendorService: VendorService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.vendorGroup = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      company: new FormControl('', Validators.required),
      contact: new FormControl(''),
      payment_period: new FormControl(''),
      address: new FormControl(''),
      notice: new FormControl('')
    });
  }

  onSubmit(form: FormGroup): void {
    const newVendor = form.value;
    this.vendorService.postVendor(newVendor).subscribe(
      res => {
        this.dialogRef.close(res)
      },
      error => {
        console.log(error);
        this.onFailure();
      }
    )
  }

  onFailure(): void {
    this._snackBar.open(`创建失败`, "关闭");
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


}
