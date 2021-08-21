import { Component, OnInit } from '@angular/core';
import {BatchService} from '../shared/services/batch.service';
import {OperationService} from '../shared/services/operation.service';
import {Batch} from '../shared/models/batch';
import {ProductService} from '../shared/services/product.service';
import {MatTableDataSource} from '@angular/material/table';
import {Compo} from '../shared/models/compo';
import {CompoService} from '../shared/services/compo.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  ongoing_batches!: Batch[]
  plan_batches!: Batch[]

  compos: Compo[] = [];
  displayCompos: Compo[] = [];

  constructor(
    private batchService: BatchService,
    private productService: ProductService,
    private operationService: OperationService,
    private compoService: CompoService
  ) { }

  ngOnInit(): void {
    this.batchService.getBatchesByStatus('ongoing').subscribe(
      batches => {
        this.ongoing_batches = batches;
        this.ongoing_batches.forEach(b => {
          this.productService.getProductNameById(b.product_id).subscribe(
            res => b.product_name = res.name
          );
        })
      },
      error => {console.log(error)}
    );
    this.batchService.getBatchesByStatus('unstarted').subscribe(
      batches => {
        this.plan_batches = batches;
        this.plan_batches.forEach(b => {
          this.productService.getProductNameById(b.product_id).subscribe(
            res => b.product_name = res.name
          );
        })
      },
      error => {console.log(error)}
    )
    this.compoService.getCompos().subscribe(
      res => {
        this.compos = res;
        this.checkWarns();
      },
      error => console.log(error)
    )
  }

  checkWarns(): void {
    this.displayCompos = this.compos.filter(compo => this.getTotalStock(compo) < compo.warn_stock);
  }

  getTotalStock(compo: Compo): number {
    return Number(compo.specification?.reduce((acc, spec) => acc + spec.stock, 0));
  }

}
