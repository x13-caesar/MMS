import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {CompoService} from '../shared/services/compo.service';
import {SpecService} from '../shared/services/spec.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Vendor} from '../shared/models/vendor';
import {Compo, CompoCategory} from '../shared/models/compo';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {VendorService} from '../shared/services/vendor.service';
import {CreateVendorDialogComponent} from '../vendor-list/create-vendor-dialog/create-vendor-dialog.component';
import {environment} from '../../environments/environment';
import {MatDialog} from '@angular/material/dialog';
import {existingIdValidator} from '../shared/existing-id.directive';
@Component({
  selector: 'app-create-spec',
  templateUrl: './create-spec.component.html',
  styleUrls: ['./create-spec.component.scss']
})
export class CreateSpecComponent implements OnInit {
  showCreateSpec: Boolean = false;

  compoGroup!: FormGroup;
  specGroup!: FormGroup;

  compos: Compo[] = [];
  compoOptions!: Observable<Compo[]>;
  selectedCompo = new FormControl('', Validators.required);
  compoCategories: CompoCategory[] = []

  vendors: Vendor[] = [];
  vendorOptions!: Observable<Vendor[]>;
  selectedVendor = new FormControl('', Validators.required);

  existingSpecIds: string[] = [];
  existingCompoIds: string[] = [];

  constructor(
    private formBuilder: FormBuilder,
    public compoService: CompoService,
    public specService: SpecService,
    public vendorService: VendorService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.compoGroup = this.formBuilder.group({
      id: new FormControl('', [Validators.required, existingIdValidator(this.existingCompoIds)]),
      name: new FormControl('', Validators.required),
      category: new FormControl('', Validators.required),
      material: new FormControl(''),
      description: new FormControl(''),
      expiration: new FormControl(''),
      unit_weight: new FormControl(''),
      fill_period: new FormControl(''),
      warn_stock: new FormControl(2000, [Validators.min(0), Validators.required]),
      notice: new FormControl(''),
      picture: new FormControl('')
    });

    this.specGroup = this.formBuilder.group({
      id: new FormControl('', [Validators.required, existingIdValidator(this.existingSpecIds)]),
      gross_price: new FormControl('', [Validators.required, Validators.min(0)]),
      net_price: new FormControl('', [Validators.required, Validators.min(0)]),
      stock: new FormControl(0, [Validators.min(0), Validators.required]),
      blueprint: new FormControl(''),
      notice: new FormControl('')
    });

    this.specService.getExistingIds().subscribe(
      res => {
        this.existingSpecIds = res;
        this.specGroup.controls['id'].setValidators([Validators.required, existingIdValidator(this.existingSpecIds)]);
      },
      error => console.log(error)
    );

    this.compoService.getCompos().subscribe(
      res => {
        this.compos = res;
        res.forEach(compo => this.existingCompoIds.push(compo.id || ''))
      },
      error => console.log(error)
    );

    this.compoService.getCompoCategories().subscribe(
      res => this.compoCategories = res
    );

    this.vendorService.getVendors().subscribe(
      res => this.vendors = res,
      error => console.log(error)
    );

    this.compoOptions = this.selectedCompo.valueChanges
      .pipe(
        map(c => this.compoService.compoAutocompleteFilter(c, this.compos))
      );
    this.vendorOptions = this.selectedVendor.valueChanges
      .pipe(
        map(v => this.vendorService.vendorAutocompleteFilter(this.vendors, v))
      );

    this.compoGroup.controls['category'].valueChanges.subscribe(
      change => this.compoGroup.controls['id'].setValue(
        this.compoCategories.find(cc => cc.category === change)?.prefix
      ))
  }


  onCompoSubmit(form: FormGroup): void {
    console.log("Sending out the new product...")
    this.compoService.postCompo(form.value).subscribe(
      res => {
        this.onSuccess('新配件');
        form.reset();
        this.compos.push(res);
        this.existingCompoIds.push(res.id!);
        form.controls['warn_stock'].setValue(2000);
        },
      error => {
        this.onFailure('新配件');
        console.log(error);
      }
    )
  }

  onSpecSubmit(form: FormGroup): void {
    const spec = form.value;
    spec['component_id'] = this.selectedCompo.value.id;
    spec['vendor_id'] = this.selectedVendor.value.id;
    console.log(spec);
    this.specService.postSpec(form.value).subscribe(
      res => {
        this.onSuccess('新供应商规格');
        form.reset();
        this.existingSpecIds.push(res.id!);
        form.controls['stock'].setValue(0);
        },
      error => {
        this._snackBar.open(error.error.detail, "关闭");
        console.log(error);
      }
    );
  }

  openCreateVendorDialog(): void {
    const dialogRef = this.dialog.open(CreateVendorDialogComponent, {
      width: environment.MEDIAN_DIALOG_WIDTH
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.vendors.push(result);
      }
    });
  }

  onSuccess(obj: string): void {
    this._snackBar.open(`${obj}成功`, "关闭");
  }

  onFailure(obj: string): void {
    this._snackBar.open(`${obj}失败`, "关闭");
  }

  generateSpecId() {
    const new_id = this.selectedCompo.value.id + this.selectedVendor.value.id.toString().padStart(3, '0');
    this.specGroup.controls['id'].setValue(new_id);
  }
}
