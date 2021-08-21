import {Component, Inject, OnInit} from '@angular/core';
import {Vendor} from '../../shared/models/vendor';
import {Observable} from 'rxjs';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SpecService} from '../../shared/services/spec.service';
import {Spec} from '../../shared/models/spec';
import {MatSnackBar} from '@angular/material/snack-bar';

class DialogData {
  spec!: Spec;
  compo_name!: string;
}

@Component({
  selector: 'app-edit-spec-dialog',
  templateUrl: './edit-spec-dialog.component.html',
  styleUrls: ['./edit-spec-dialog.component.scss']
})
export class EditSpecDialogComponent implements OnInit {
  specGroup!: FormGroup;

  vendors: Vendor[] = [];
  vendorOptions!: Observable<Vendor[]>;
  selectedVendor = new FormControl('', Validators.required);


  constructor(
    public dialogRef: MatDialogRef<EditSpecDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private specService: SpecService,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.specGroup = this.formBuilder.group({
      id: new FormControl('', Validators.required),
      gross_price: new FormControl('', Validators.required),
      net_price: new FormControl('', Validators.required),
      stock: new FormControl(0, Validators.required),
      notice: new FormControl(''),
    });
    this.specGroup.setValue(this.data.spec);
  }

  onSpecInfoConfirm(form: FormGroup): void {
    const updated_spec = {...this.data.spec, ...form.value};
    this.specService.putSpec(updated_spec).subscribe(
      res => {
        this.dialogRef.close(res);
      },
      error => {
        this.onFailure('规格信息修改');
        console.log(error);
      }
    );
  }


  onFailure(eventString: string): void {
    this._snackBar.open(`${eventString}失败`, "关闭");
  }

}
