import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Compo} from '../../shared/models/compo';
import {Observable} from 'rxjs';
import {Vendor} from '../../shared/models/vendor';
import {CompoService} from '../../shared/services/compo.service';
import {SpecService} from '../../shared/services/spec.service';
import {VendorService} from '../../shared/services/vendor.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';

class DialogData {
  compo!: Compo
}

@Component({
  selector: 'app-edit-component-dialog',
  templateUrl: './edit-component-dialog.component.html',
  styleUrls: ['./edit-component-dialog.component.scss']
})
export class EditComponentDialogComponent implements OnInit {
  compoGroup!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditComponentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private formBuilder: FormBuilder,
    private compoService: CompoService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.compoGroup = this.formBuilder.group({
      id: new FormControl(''),
      name: new FormControl('', Validators.required),
      category: new FormControl('', Validators.required),
      material: new FormControl(''),
      description: new FormControl(''),
      expiration: new FormControl(''),
      unit_weight: new FormControl(''),
      fill_period: new FormControl(''),
      warn_stock: new FormControl(1000, Validators.min(0)),
      notice: new FormControl(''),
      picture: new FormControl('')
    });
    this.compoGroup.setValue({
      id: this.data.compo.id,
      name: this.data.compo.name,
      category: this.data.compo.category,
      material: this.data.compo.material,
      description: this.data.compo.description,
      expiration: this.data.compo.expiration,
      unit_weight: this.data.compo.unit_weight,
      fill_period: this.data.compo.fill_period,
      warn_stock: this.data.compo.warn_stock,
      notice: this.data.compo.notice,
      picture: this.data.compo.picture,
    });
  }

  onCompoInfoConfirm(form: FormGroup): void {
    const updated_compo: Compo = {...form.value};
    updated_compo.id = this.data.compo.id;
    console.log(updated_compo);
    this.compoService.putCompo(updated_compo).subscribe(
      res => {
        this.dialogRef.close(res);
      },
      error => {
        this.onFailure('配件信息修改');
        console.log(error);
      }
    )
  }

  onFailure(eventString: string): void {
    this._snackBar.open(`${eventString}失败`, "关闭");
  }

}
