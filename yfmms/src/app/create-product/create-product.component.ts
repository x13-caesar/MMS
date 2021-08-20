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

  constructor(
    private productService: ProductService,
    private compoService: CompoService,
    private _snackBar: MatSnackBar,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.productGroup = this.formBuilder.group({
      id: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      category: new FormControl('', Validators.required),
      description: new FormControl(''),
      inventory: new FormControl(0, Validators.min(0)),
      notice: new FormControl(''),
      picture: new FormControl('')
    });
    this.processGroup = this.formBuilder.group({
      process_name: new FormControl('', Validators.required),
      process_order: new FormControl('', Validators.required),
      notice: new FormControl('')
    });
    this.processCompoGroup = this.formBuilder.group({
      component_id: new FormControl('', Validators.required),
      attrition_rate: new FormControl(0.001)
    });
    this.productGroup.valueChanges.subscribe(product => this.newProduct = product);
    this.compoService.getCompos().subscribe(
      res => this.compos = res,
      error => console.log(error)
    );
    this.compoOptions = this.selectedCompo.valueChanges
      .pipe(
        map((c : string | null) => c ? this.compoAutocompleteFilter(c) : this.compos.slice())
      );
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
    }
  }

  onProductSubmit(form: FormGroup): void {
    this.newProduct = {...this.newProduct, ...form.value}
  }

  onProcessSubmit(form: FormGroup): void {
    const newProcess: Process = form.value;
    newProcess.process_component = this.composOfProcess.map(
      compo => {
        const pc: ProcessComponent = {
          component_id: compo.id || 'placeholder',
          attrition_rate: 0.001,
          component_name: compo.name
        }
        return pc;
      })
    this.processOfProduct.push(newProcess);
    this.processGroup.reset();
    this.selectedCompo.reset();
    this.composOfProcess = [];
  }

  onFinalSubmit(): void {
    console.log("Sending out the new product...")
    this.newProduct.process = this.processOfProduct;
    console.log(this.newProduct)
    this.productService.postProduct(this.newProduct).subscribe(
        res => { res.success ? this.onSuccess() : this.onFailure(); },
        error => this.onFailure()
      )
  }

  onSuccess(): void {
    this._snackBar.open("创建成功", "关闭");
  }

  onFailure(): void {
    this._snackBar.open("创建失败", "关闭");
  }

  compoAutocompleteFilter(value: string): Compo[] {
    return this.compos.filter(c => c.name.includes(value));
  }

  compoDisplayFn(compo: Compo): string {
    return compo && compo.name ? `${compo.name} | ${compo.id}` : '';
  }
}
