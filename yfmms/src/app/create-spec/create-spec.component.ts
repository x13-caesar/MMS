import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {CompoService} from '../shared/services/compo.service';
import {SpecService} from '../shared/services/spec.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Vendor} from '../shared/models/vendor';
import {Compo} from '../shared/models/compo';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {VendorService} from '../shared/services/vendor.service';
import {CreateVendorDialogComponent} from '../vendor-list/create-vendor-dialog/create-vendor-dialog.component';
import {environment} from '../../environments/environment';
import {MatDialog} from '@angular/material/dialog';

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

  vendors: Vendor[] = [];
  vendorOptions!: Observable<Vendor[]>;
  selectedVendor = new FormControl('', Validators.required);

  constructor(
    private formBuilder: FormBuilder,
    private compoService: CompoService,
    private specService: SpecService,
    private vendorService: VendorService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.compoGroup = this.formBuilder.group({
      id: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      category: new FormControl('', Validators.required),
      material: new FormControl(''),
      description: new FormControl(''),
      expiration: new FormControl(''),
      unit_weight: new FormControl(''),
      warn_stock: new FormControl(1000, Validators.min(0)),
      notice: new FormControl(''),
      picture: new FormControl('')
    });

    this.specGroup = this.formBuilder.group({
      id: new FormControl('', Validators.required),
      gross_price: new FormControl(''),
      net_price: new FormControl(''),
      stock: new FormControl(0),
      blueprint: new FormControl(''),
      notice: new FormControl('')
    });

    this.compoService.getCompos().subscribe(
      res => this.compos = res,
      error => console.log(error)
    );
    this.vendorService.getVendors().subscribe(
      res => this.vendors = res,
      error => console.log(error)
    );

    this.compoOptions = this.selectedCompo.valueChanges
      .pipe(
        map(c => this.compoAutocompleteFilter(c))
      );
    this.vendorOptions = this.selectedVendor.valueChanges
      .pipe(
        map(v => this.vendorAutocompleteFilter(v))
      );
  }

  compoAutocompleteFilter(value: string): Compo[] {
    return this.compos.filter(c => c.name.includes(value));
  }

  vendorAutocompleteFilter(value: string): Vendor[] {
    return this.vendors.filter(v => (v.name.includes(value) || v.company.includes(value)));
  }

  compoDisplayFn(compo: Compo): string {
    return compo && compo.name ? `${compo.name} | ${compo.id}` : '';
  }

  vendorDisplayFn(vendor: Vendor): string {
    return vendor && vendor.name ? `${vendor.name} | ${vendor.company}` : '';
  }

  onCompoSubmit(form: FormGroup): void {
    console.log("Sending out the new product...")
    this.compoService.postCompo(form.value).subscribe(
      res => {
        this.onSuccess('新配件');
        form.reset();
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
        },
      error => {
        this.onFailure('新供应商规格')
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
    this._snackBar.open(`创建${obj}成功`, "关闭");
  }

  onFailure(obj: string): void {
    this._snackBar.open(`创建${obj}失败`, "关闭");
  }

}
