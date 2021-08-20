import { Component, OnInit } from '@angular/core';
import {BatchService} from '../shared/services/batch.service';
import {OperationService} from '../shared/services/operation.service';
import {Batch} from '../shared/models/batch';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  ongoing_batches!: Batch[]
  plan_batches!: Batch[]

  constructor(
    private batchService: BatchService,
    private operationService: OperationService
  ) { }

  ngOnInit(): void {
    this.batchService.getBatchesByStatus('ongoing').subscribe(
      batches => {
        this.ongoing_batches = batches
      },
      error => {console.log(error)}
    );
    this.batchService.getBatchesByStatus('unstarted').subscribe(
      batches => {
        this.plan_batches = batches
      },
      error => {console.log(error)}
    )
  }

}
