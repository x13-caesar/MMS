import {BatchProcess} from './batch-process';

export interface Batch {
  id?: number,
  product_id: string,
  product_name?: string,
  plan_amount: number,
  actual_amount?: number,
  create: Date,
  start: Date,
  end?: Date | string,
  ship?: Date,
  notice?: string,
  status: string
  batch_process: BatchProcess[],
  // for report
  ideal_unit_spec_cost?: number,
  ideal_unit_work_cost?: number;
  actual_unit_spec_cost?: number,
  actual_total_spec_cost?: number,
  actual_total_work_cost?: number,
  actual_unit_overall_cost?: number
}
