import {Process} from './process';

export interface Product {
  id?: number,
  name: string,
  category: string,
  description?: string,
  last_produce?: string,
  inventory: number,
  picture?: string,
  notice?: string,
  process?: Process[]
}
