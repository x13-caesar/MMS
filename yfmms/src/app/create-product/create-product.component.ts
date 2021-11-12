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
import {ProcessService} from '../shared/services/process.service';
import {existingOrderValidator} from '../shared/existing-order.directive';

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

  compos: Compo[] = [];
  compoOptions!: Observable<Compo[]>;
  selectedCompo = new FormControl();
  compoNumber = new FormControl(1);
  compoArr: CompoRecord[] = [];

  // MAT chip list params
  selectable = true;

  @ViewChild('compoInput') compoInput!: ElementRef<HTMLInputElement>;
  public editProductId: string = '';
  public originProductId: string = '';
  public newProductId: string = ''

  constructor(
    private productService: ProductService,
    public processService: ProcessService,
    public compoService: CompoService,
    private _snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.editProductId = this.route.snapshot.paramMap.get('pid') || '';
    this.originProductId = this.route.snapshot.paramMap.get('origin_id') || '';
    this.newProductId = this.route.snapshot.paramMap.get('new_id') || '';
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
      process_order: new FormControl(1,
        [Validators.required, Validators.min(1),
          existingOrderValidator(this.processOfProduct.map(p => p.process_order))]),
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
          this.processGroup.controls['process_order'].setValue((target_prod.process?.length || 0) + 1);
          this.newProduct = target_prod;
          this.processOfProduct = target_prod.process || [];
          this.processGroup.controls['process_order'].setValidators(
            [Validators.required, Validators.min(1), existingOrderValidator(this.processOfProduct.map(p => p.process_order))])
          delete target_prod.process;
          this.productGroup.setValue({
            id: target_prod.id,
            name: target_prod.name,
            category: target_prod.category,
            description: target_prod.description,
            inventory: target_prod.inventory,
            custom: target_prod.custom,
            notice: target_prod.notice,
            picture: target_prod.picture
          });
          if (this.newProductId) {
            this.productGroup.controls['id'].setValue(this.newProductId);
          }
        }
      );
      this.originProductId && this.productGroup.controls['id'].setValue(this.originProductId);
      this.editProductId && this.productGroup.controls['id'].disable();
    }
  }


  removeProcess(process: Process): void {
    const index = this.processOfProduct.indexOf(process);
    if (index >= 0) {
      this.processOfProduct.splice(index, 1);
      this.processGroup.controls['process_order'].setValue(this.processOfProduct.length + 1);
      this.processGroup.controls['process_order'].setValidators(
        [Validators.required, Validators.min(1), existingOrderValidator(this.processOfProduct.map(p => p.process_order))])
    }
  }

  onProcessSubmit(form: FormGroup): void {
    const newProcess: Process = {...form.value, product_id: this.productGroup.controls['id'].value};
    newProcess.process_component = [];
    this.compoArr.forEach(
      record => {
        const pc: ProcessComponent = {
            consumption: record.amount,
            component_id: record.id || '',
            attrition_rate: 0.001,
            component_name: record.name
          }
        newProcess.process_component.push(pc);
      });
    this.processOfProduct.push(newProcess);
    this.processGroup.reset();
    this.selectedCompo.reset();
    this.compoArr = [];
    this.processGroup.controls['process_order'].setValue(this.processOfProduct.length + 1)
    this.processGroup.controls['process_order'].setValidators([Validators.required, Validators.min(1), existingOrderValidator(this.processOfProduct.map(p => p.process_order))])
  }

  onFinalSubmit(): void {
    this.newProduct = {...this.newProduct, ...this.productGroup.value};
    this.newProduct.process = this.processService.sortedProcesses(this.processOfProduct);
    console.log(this.newProduct);
    this.productService.postProduct(this.newProduct).subscribe(
        res => {
          this.onSuccess('创建产品');
          this.productGroup.reset();
          this.productGroup.reset();
          this.processOfProduct = [];
          this.compoArr = [];
        },
        error => this.onFailure('创建产品')
      )
  }

  onConfirmEdit() {
    this.newProduct = {...this.newProduct, ...this.productGroup.value};
    this.newProduct.process = this.processService.sortedProcesses(this.processOfProduct);
    console.log(this.newProduct);
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

  editProcess(process: Process) {
    const index = this.processOfProduct.indexOf(process);
    if (index >= 0) {
      this.processOfProduct.splice(index, 1);
    }
    const pcs = process.process_component;
    this.processGroup.setValue({
      process_name: process.process_name,
      process_order: process.process_order,
      unit_pay: process.unit_pay,
      notice: process.notice,
    });
    this.compoArr = pcs.map(pc => {
      return {id: pc.component_id, name: pc.component_name || '', amount: pc.consumption}
    })
    this.processGroup.controls['process_order'].setValidators([Validators.required, Validators.min(1),
      existingOrderValidator(this.processOfProduct.map(p => p.process_order))])
    // this.composOfProcess = pcs.map(pc => this.compos.find(c => c.id === pc.component_id) || this.compos[0]);
  }

  rearrangeProcess() {
    this.processOfProduct = this.processService.sortedProcesses(this.processOfProduct)
    let count = 1;
    this.processOfProduct.forEach(p => {
      p.process_order = count;
      count++;
    });
    this.onSuccess('重排序');
  }

  moveProcessUp(process: Process) {
    const initOrder = process.process_order;
    const idx = this.processOfProduct.indexOf(process);
    const upOrder = this.processOfProduct[idx-1].process_order;
    this.processOfProduct[idx].process_order = upOrder;
    this.processOfProduct[idx-1].process_order = initOrder;
    this.processService.sortedProcesses(this.processOfProduct);
  }

  moveProcessDown(process: Process) {
    const initOrder = process.process_order;
    const idx = this.processOfProduct.indexOf(process);
    const downOrder = this.processOfProduct[idx+1].process_order;
    this.processOfProduct[idx].process_order = downOrder;
    this.processOfProduct[idx+1].process_order = initOrder;
    this.processService.sortedProcesses(this.processOfProduct);
  }

  pushToCompoArr() {
    const targetIdx = this.compoArr.findIndex(record => record.id === this.selectedCompo.value.id);
    if (targetIdx >= 0) {
      const prev = this.compoArr[targetIdx];
      // @ts-ignore
      prev.amount += this.compoNumber.value;
      this.compoArr[targetIdx] = prev;
    } else {
      // @ts-ignore
      this.compoArr.push(
        {id: this.selectedCompo.value.id,
          name: this.selectedCompo.value.name,
          amount: this.compoNumber.value})
    }
    this.compoNumber.setValue(1);
  }

  removeFromCompoArr(c: CompoRecord) {
    const targetIdx = this.compoArr.findIndex(record => record.id === c.id);
    if (targetIdx >= 0) {
      this.compoArr.splice(targetIdx, 1);
    }
  }
}

class CompoRecord {
  id!: string
  name!: string
  amount!: number
}
