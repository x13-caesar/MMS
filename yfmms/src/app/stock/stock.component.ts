import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {APIDataSource} from '../shared/models/api-data-source';
import {CompoService} from '../shared/services/compo.service';
import {DataSource} from '@angular/cdk/collections';
import {Product} from '../shared/models/product';
import {ProductService} from '../shared/services/product.service';
import {Observable} from 'rxjs';
import {Compo} from '../shared/models/compo';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {SpecService} from '../shared/services/spec.service';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {CreateVendorDialogComponent} from '../vendor-list/create-vendor-dialog/create-vendor-dialog.component';
import {environment} from '../../environments/environment';
import {Vendor} from '../shared/models/vendor';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {EditComponentDialogComponent} from './edit-component-dialog/edit-component-dialog.component';
import {DeleteComponentDialogComponent} from './delete-component-dialog/delete-component-dialog.component';
import {Spec} from '../shared/models/spec';
import {EditSpecDialogComponent} from './edit-spec-dialog/edit-spec-dialog.component';
import {JWTTokenService} from '../shared/services/jwt-token.service';


@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class StockComponent implements OnInit, AfterViewInit {
  displayedProperties: string[] = [
    'id', 'name', 'category', 'material', 'description', 'warn_stock', 'edit'
  ];

  displayedColumns = new Map([['id', '配件编码'], ['name','配件名称'],
    ['category', '分类'], ['description', '描述'], ['material', '材料'], ['warn_stock', '警示库存'],
    ['edit', '操作']]);

  compos: Compo[] = [];
  displayCompos: Compo[] = [];
  dataSource: any;
  expandedElement!: Compo | null;

  dangerousCompos: Compo[] = [];

  filterGroup!: FormGroup;

  materials: (string | undefined)[] = [];
  categories: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private compoService: CompoService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    public _snackBar: MatSnackBar,
    public jwtTokenService: JWTTokenService
  ) { }

  ngOnInit(): void {
    this.compoService.getCompos().subscribe(
      res => {
        this.compos = res;
        this.displayCompos = this.compos;
        this.dangerousCompos = this.compos.filter(compo => Number(compo.specification?.reduce((acc, spec) => acc + spec.stock, 0)) < compo.warn_stock);
        this.materials = res.map(compo => compo.material).filter((v, idx, arr) => !!v && arr.indexOf(v) === idx);
        this.categories = res.map(compo => compo.category).filter((v, idx, arr) => !!v && arr.indexOf(v) === idx);
        this.dataSource = new MatTableDataSource<Compo>(this.displayCompos);
        this.dataSource.paginator = this.paginator;
      }
    );
    this.filterGroup = this.formBuilder.group({
      keyword: new FormControl(''),
      material: new FormControl(null),
      category: new FormControl(null)
    });
    this.filterGroup.valueChanges.subscribe(
      changes => {
        this.displayCompos = this.compoService.compoSearchFilter(this.compos, changes);
        this.dataSource = new MatTableDataSource<Compo>(this.displayCompos);
      }
    );
  }

  ngAfterViewInit() {
  }

  emptyFilter(): void {
    this.filterGroup.reset()
    this.displayCompos = this.compos;
    this.dataSource = new MatTableDataSource<Compo>(this.displayCompos);
  }

  checkWarns(): void {
    this.displayCompos = this.compos.filter(compo => Number(compo.specification?.reduce((acc, spec) => acc + spec.stock, 0)) < compo.warn_stock);
    this.dataSource = new MatTableDataSource<Compo>(this.displayCompos);
  }

  openEditCompoDialog(compo: Compo): void {
    const dialogRef = this.dialog.open(EditComponentDialogComponent, {
      width: environment.LARGE_DIALOG_WIDTH,
      data: {compo: compo}
    });

    dialogRef.afterClosed().subscribe(updated_compo => {
      if (!!updated_compo) {
        const idx = this.displayCompos.findIndex(c => c.id === updated_compo.id);
        this.displayCompos[idx] = {...this.displayCompos[idx], ...updated_compo};
        this.dataSource = new MatTableDataSource<Compo>(this.displayCompos);
        this.dataSource.paginator = this.paginator;
        this._snackBar.open("修改成功", "关闭")
      }
    });
  }

  openDeleteCompoDialog(compo: Compo): void {
    const dialogRef = this.dialog.open(DeleteComponentDialogComponent, {
      width: environment.LARGE_DIALOG_WIDTH,
      data: {compo: compo}
    });

    dialogRef.afterClosed().subscribe(res => {
      if (!!res) {
        const idx = this.displayCompos.findIndex(c => c.id === compo.id);
        if (idx > -1) {
          this.displayCompos.slice(idx, 1);
          this.dataSource = new MatTableDataSource<Compo>(this.displayCompos);
          this.dataSource.paginator = this.paginator;
          this._snackBar.open("删除成功", "关闭")
        }
      }
    });
  }

  openEditSpecDialog(spec: Spec, compo_name: string): void {
    const dialogRef = this.dialog.open(EditSpecDialogComponent, {
      width: environment.SMALL_DIALOG_WIDTH,
      data: {spec: spec, compo_name: compo_name}
    });

    dialogRef.afterClosed().subscribe(updated_spec => {
      if (!!updated_spec) {
        const idx = this.displayCompos.findIndex(c => c.id === updated_spec.id);
        this.displayCompos[idx] = {...this.displayCompos[idx], ...updated_spec};
        this.dataSource = new MatTableDataSource<Compo>(this.displayCompos);
        this.dataSource.paginator = this.paginator;
        this._snackBar.open("修改成功", "关闭")
      }
    });
  }
}
