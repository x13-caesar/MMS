import {Product} from './product';
import {BatchProcess} from './batch-process';

export interface Batch {
  id?: number,
  product_id: number,
  product_name?: string,
  plan_amount: number,
  actual_amount?: number,
  create: Date,
  start: Date,
  end?: Date | string,
  ship?: Date,
  notice?: string,
  status: string
  batch_process: BatchProcess[]
}
