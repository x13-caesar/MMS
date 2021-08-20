export interface WarehouseRecord {
  id?: number,
  batch_process_id: number,
  component_id: string,
  specification_id: string,
  component_name: string,
  consumption: number
}
