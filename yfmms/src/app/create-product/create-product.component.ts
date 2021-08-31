import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ProductService} from '../shared/services/product.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Product} from '../shared/models/product';
import {Compo} from '../shared/models/compo';
import {Observable} from 'rxjs';
import {CompoService} from '../shared/services/compo.service';
import {map} from 'rxjs/operators';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {Process} from '../shared/models/process';
import {ProcessComponent} from '../shared/models/process-component';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss']
})
export class CreateProductComponent implements OnInit {
  productGroup!: FormGroup
  newProduct!: Product;

  processGroup!: FormGroup
  processOfProduct: Process[] = []

  processCompoGroup!: FormGroup
  composOfProcess: Compo[] = []

  compos: Compo[] = [];
  compoOptions!: Observable<Compo[]>;
  selectedCompo = new FormControl();

  // MAT chip list params
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  @ViewChild('compoInput') compoInput!: ElementRef<HTMLInputElement>;
  public editProductId: string = '';
  public originProductId: string = '';

  constructor(
    private productService: ProductService,
    private compoService: CompoService,
    private _snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.editProductId = this.route.snapshot.paramMap.get('pid') || '';
    this.originProductId = this.route.snapshot.paramMap.get('origin_id') || '';
    this.productGroup = this.formBuilder.group({
      id: new FormControl('', [Validators.required, Validators.maxLength(16), Validators.pattern('[a-zA-Z0-9]*')]),
      name: new FormControl('', Validators.required),
      category: new FormControl('', Validators.required),
      description: new FormControl(''),
      inventory: new FormControl(0, Validators.min(0)),
      custom: new FormControl(''),
      notice: new FormControl(''),
      picture: new FormControl('')
    });
    this.processGroup = this.formBuilder.group({
      process_name: new FormControl('', Validators.required),
      process_order: new FormControl(1, [Validators.required, Validators.min(1)]),
      unit_pay: new FormControl(null, [Validators.required, Validators.min(0)]),
      notice: new FormControl('')
    });
    this.processCompoGroup = this.formBuilder.group({
      component_id: new FormControl('', Validators.required),
      attrition_rate: new FormControl(0.001)
    });
    this.productGroup.valueChanges.subscribe(product => this.newProduct = {...this.newProduct, ...product});
    this.compoService.getCompos().subscribe(
      res => this.compos = res,
      error => console.log(error)
    );
    this.compoOptions = this.selectedCompo.valueChanges
      .pipe(
        map((c : string | null) => c ? this.compoAutocompleteFilter(c) : this.compos.slice())
      );
    if (this.editProductId || this.originProductId) {
      this.productService.getProductById(this.editProductId || this.originProductId).subscribe(
        target_prod => {
          target_prod.process?.forEach(p => p.process_component.forEach(pc => pc.component_name = pc.component?.name));
          this.newProduct = target_prod;
          this.processOfProduct = target_prod.process || [];
          delete target_prod.process;
          this.productGroup.setValue(target_prod);
        }
      );
      this.originProductId && this.productGroup.controls['id'].setValue(this.originProductId);
      this.editProductId && this.productGroup.controls['id'].disable();
    }
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      // @ts-ignore
      this.composOfProcess.push(value);
    }

    this.selectedCompo.setValue(null);
  }

  remove(compo: Compo): void {
    const index = this.composOfProcess.indexOf(compo);

    if (index >= 0) {
      this.composOfProcess.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.composOfProcess.push(event.option.value);
    this.compoInput.nativeElement.value = '';
    this.selectedCompo.setValue(null);
  }

  removeProcess(process: Process): void {
    const index = this.processOfProduct.indexOf(process);
    if (index >= 0) {
      this.processOfProduct.splice(index, 1);
      this.processGroup.controls['process_order'].setValue(this.processOfProduct.length + 1)
    }
  }

  onProcessSubmit(form: FormGroup): void {
    const newProcess: Process = {...form.value, product_id: this.productGroup.controls['id'].value};
    newProcess.process_component = [];
    this.composOfProcess.forEach(
      compo => {
        const existingIdx = newProcess.process_component.findIndex(pc => pc.component_id === compo.id)
        if (existingIdx >= 0) {
          newProcess.process_component[existingIdx].consumption += 1
        } else {
          const pc: ProcessComponent = {
            consumption: 1,
            component_id: compo.id || 'placeholder',
            attrition_rate: 0.001,
            component_name: compo.name
          }
          newProcess.process_component.push(pc);
        }
      });
    this.processOfProduct.push(newProcess);
    this.processGroup.reset();
    this.selectedCompo.reset();
    this.composOfProcess = [];
    this.processGroup.controls['process_order'].setValue(this.processOfProduct.length + 1)
  }

  onFinalSubmit(): void {
    this.newProduct = {...this.newProduct, ...this.productGroup.value}
    this.newProduct.process = this.processOfProduct;
    console.log(this.newProduct)
    this.productService.postProduct(this.newProduct).subscribe(
        res => {
          this.onSuccess('创建产品');
          this.productGroup.reset();
          this.productGroup.reset();
          this.processOfProduct = [];
          this.composOfProcess = [];
        },
        error => this.onFailure('创建产品')
      )
  }

  onConfirmEdit() {
    this.newProduct = {...this.newProduct, ...this.productGroup.value}
    this.newProduct.process = this.processOfProduct;
    console.log(this.newProduct)
    this.productService.putProduct(this.newProduct).subscribe(
      res => {
        this.onSuccess('编辑产品信息');
        this.router.navigateByUrl('/inventory');
      },
      error => this.onFailure('编辑产品信息')
    )
  }

  onSuccess(eventString: string): void {
    this._snackBar.open(`${eventString}成功`, "关闭");
  }

  onFailure(eventString: string): void {
    this._snackBar.open(`${eventString}失败`, "关闭");
  }

  compoAutocompleteFilter(value: string): Compo[] {
    return this.compos.filter(c => c.name.includes(value));
  }

  compoDisplayFn(compo: Compo): string {
    return compo && compo.name ? `${compo.name} | ${compo.id}` : '';
  }

  sortedProcessArray(process_array: Process[]): Process[] {
    return process_array.sort((a, b) => (Number(a.process_order) - Number(b.process_order)))
  }

  editProcess(process: Process) {
    const index = this.processOfProduct.indexOf(process);
    if (index >= 0) {
      this.processOfProduct.splice(index, 1);
    }
    const pcs = process.process_component;
    console.log(this.composOfProcess);
    this.processGroup.setValue({
      process_name: process.process_name,
      process_order: process.process_order,
      unit_pay: process.unit_pay,
      notice: process.notice,
    });
    this.composOfProcess = pcs.map(pc => this.compos.find(c => c.id === pc.component_id) || this.compos[0]);
    console.log(this.composOfProcess);
  }

}
