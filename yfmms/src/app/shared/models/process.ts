import {ProcessComponent} from './process-component';

export interface Process {
  id?: number,
  product_id: number,
  process_name: string,
  process_order: number,
  notice: string,
  process_component: ProcessComponent[]
}
