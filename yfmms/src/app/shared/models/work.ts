import {WorkSpecification} from './work-specification';

export interface Work {
  id?: number,
  batch_process_id: number,
  employee_id: number,
  employee_name: string,
  work_date: string,
  plan_unit: number,
  unit_pay: number,
  complete_unit: number,
  hour_pay: number,
  complete_hour: number,
  work_specification?: WorkSpecification[],
  product_name: string,
  process_name: string,
  check: boolean,
  salary_id?: number
}

