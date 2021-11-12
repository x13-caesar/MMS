import {Buyer} from './buyer';

export interface Delivery {
  id?: number,
  product_id: string,
  amount: number,
  order_id?: string,
  buyer_id: number,
  deliver_date: Date,
  unit_price: number,
  total_price: number,
  notice?: string,
  buyer?: Buyer,
  buyer_company?: string,
  product_name?: string
}
