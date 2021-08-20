import {Work} from './work';
import {Process} from './process';
import {WarehouseRecord} from './warehouse-record';

export interface BatchProcess {
  id?: number,
  status: string,
  process_id: number,
  batch_id: number,
  start_amount?: number,
  end_amount?: number
  work?: Work[],
  process?: Process,
  warehouse_record?: WarehouseRecord[]
}
