import {Spec} from './spec';

export interface Compo {
  id?: string,
  name: string,
  category: string,
  material?: string,
  description?: string,
  expiration?: string,
  unit_weight?: string,
  warn_stock: number,
  picture?: string,
  notice?: string,
  specification?: Spec[]
}
