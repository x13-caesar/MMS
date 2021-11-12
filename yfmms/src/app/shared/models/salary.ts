import {DayInvoice} from '../services/day-invoice';

export interface Salary {
  id?: number,
  employee_id: number,
  employee_name: string,
  start_date: Date,
  end_date: Date
  unit_salary: number,
  hour_salary: number,
  deduction: number,
  bonus: number,
  status: string,
  notice: string,
  check_date?: Date,
  day_invoice?: DayInvoice[]
}
