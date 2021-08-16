import {Product} from './product';
import {BatchProcess} from './batch-process';

export interface Batch {
  id?: number,
  product_id: number,
  product_name?: string,
  plan_amount: number,
  actual_amount?: number,
  create: string,
  start: string,
  end?: string,
  ship?: string,
  notice?: string,
  status: string
  batch_process: BatchProcess[]
}
