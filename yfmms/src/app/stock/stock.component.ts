import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {CompoService} from '../shared/services/compo.service';
import {Compo, CompoCategory} from '../shared/models/compo';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {environment} from '../../environments/environment';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {EditComponentDialogComponent} from './edit-component-dialog/edit-component-dialog.component';
import {DeleteComponentDialogComponent} from './delete-component-dialog/delete-component-dialog.component';
import {Spec} from '../shared/models/spec';
import {EditSpecDialogComponent} from './edit-spec-dialog/edit-spec-dialog.component';
import {JWTTokenService} from '../shared/services/jwt-token.service';
import {AddSpecDialogComponent} from './add-spec-dialog/add-spec-dialog.component';
import {ActivatedRoute} from '@angular/router';
import {DeleteSpecConfirmDialogComponent} from './delete-spec-confirm-dialog/delete-spec-confirm-dialog.component';


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
    'id', 'name', 'category', 'material', 'description', 'fill_period', 'measure', 'warn_stock', 'edit'
  ];

  displayedColumns = new Map([['id', '配件编码'], ['name','配件名称'],
    ['category', '分类'], ['description', '描述'], ['material', '材料'], ['fill_period', '交货周期'], ['measure', '库存单位'], ['warn_stock', '警示库存'],
    ['edit', '操作']]);

  compos: Compo[] = [];
  displayCompos: Compo[] = [];
  dataSource: any;
  expandedElement!: Compo | null;

  dangerousCompos: Compo[] = [];

  filterGroup!: FormGroup;

  materials: (string | undefined)[] = [];
  categories: CompoCategory[] = [];

  warn_compo_id!: string

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private compoService: CompoService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    public _snackBar: MatSnackBar,
    public jwtTokenService: JWTTokenService,
    public route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.warn_compo_id = this.route.snapshot.paramMap.get('warn_compo_id') || '';
    this.compoService.getCompos().subscribe(
      res => {
        this.compos = res;
        this.displayCompos = this.compos;
        this.dangerousCompos = this.compos.filter(compo => Number(compo.specification?.reduce((acc, spec) => acc + spec.stock, 0)) < compo.warn_stock);
        this.materials = res.map(compo => compo.material).filter((v, idx, arr) => !!v && arr.indexOf(v) === idx);
        this.dataSource = new MatTableDataSource<Compo>(this.displayCompos);
        this.dataSource.paginator = this.paginator;
      }
    );
    this.compoService.getCompoCategories().subscribe(
      res => this.categories = res
    )
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
    if (this.warn_compo_id) {
      this.checkWarns();
    }
  }

  ngAfterViewInit() {
  }

  emptyFilter(): void {
    this.filterGroup.setValue({
      keyword: '',
      material: null,
      category: null,
    })
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
        const idx1 = this.displayCompos.findIndex(c => c.id === updated_compo.id);
        this.displayCompos[idx1] = {...this.displayCompos[idx1], ...updated_compo};
        const idx2 = this.compos.findIndex(c => c.id === updated_compo.id);
        this.compos[idx2] = {...this.compos[idx2], ...updated_compo};
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

  openEditSpecDialog(spec: Spec, compo: Compo): void {
    const dialogRef = this.dialog.open(EditSpecDialogComponent, {
      width: environment.SMALL_DIALOG_WIDTH,
      data: {spec: spec, compo_name: compo.name}
    });

    dialogRef.afterClosed().subscribe(updated_spec => {
      if (updated_spec) {
        spec = {...updated_spec};
        const spec_idx = compo.specification?.findIndex(s => s.id === spec.id);
        // @ts-ignore
        compo.specification[spec_idx] = spec;
        const idx1 = this.displayCompos.findIndex(c => c.id === compo.id);
        this.displayCompos[idx1] = {...this.displayCompos[idx1], ...compo};
        const idx2 = this.compos.findIndex(c => c.id === compo.id);
        this.compos[idx2] = {...this.compos[idx2], ...compo};
        // this.dataSource = new MatTableDataSource<Compo>(this.displayCompos);
        // this.dataSource.paginator = this.paginator;
        this._snackBar.open("修改成功", "关闭")
      }
    });
  }

  openAddSpecDialog(compo: Compo) {
    const dialogRef = this.dialog.open(AddSpecDialogComponent, {
      width: environment.SMALL_DIALOG_WIDTH,
      data: {compo: compo}
    });

    dialogRef.afterClosed().subscribe(new_spec => {
      if (new_spec) {
        console.log(new_spec);
        compo.specification?.push(new_spec);
        const idx1 = this.displayCompos.findIndex(c => c.id === compo.id);
        this.displayCompos[idx1] = {...this.displayCompos[idx1], ...compo};
        const idx2 = this.compos.findIndex(c => c.id === compo.id);
        this.compos[idx2] = {...this.compos[idx2], ...compo};
        // this.dataSource = new MatTableDataSource<Compo>(this.displayCompos);
        // this.dataSource.paginator = this.paginator;
        this._snackBar.open("添加成功", "关闭")
      }
    });
  }

  openDeleteSpecDialog(spec: Spec, compo: Compo) {
    const dialogRef = this.dialog.open(DeleteSpecConfirmDialogComponent, {
      width: environment.LARGE_DIALOG_WIDTH,
      data: {spec: spec, compo: compo}
    });

    dialogRef.afterClosed().subscribe(res => {
      if (!!res) {
        const idx = compo.specification?.findIndex(s => s.id === spec.id);
        if (idx! > -1) {
          compo.specification?.slice(idx, 1);
          const idx1 = this.displayCompos.findIndex(c => c.id === compo.id);
          this.displayCompos[idx1] = {...this.displayCompos[idx1], ...compo};
          const idx2 = this.compos.findIndex(c => c.id === compo.id);
          this.compos[idx2] = {...this.compos[idx2], ...compo};
          this.dataSource = new MatTableDataSource<Compo>(this.displayCompos);
          this._snackBar.open("删除成功", "关闭")
        }
      }
    });
  }
}
