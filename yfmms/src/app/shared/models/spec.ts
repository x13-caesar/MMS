import {Vendor} from './vendor';
import {Compo} from './compo';

export interface Spec {
  id?: string,
  component_id: string,
  vendor_id: string,
  vendor?: Vendor,
  gross_price?: number,
  net_price?: number,
  stock: number,
  blueprint?: string,
  notice?: string
}
