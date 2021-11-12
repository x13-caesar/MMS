from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class VendorBase(BaseModel):
    name: str
    company: str
    payment_period: Optional[str] = None
    contact: Optional[str] = None
    address: Optional[str] = None
    notice: Optional[str] = None


class VendorCreate(VendorBase):
    pass


class Vendor(VendorBase):
    id: int

    class Config:
        orm_mode = True


class ComponentBase(BaseModel):
    id: str
    name: str
    category: str
    material: Optional[str]
    description: Optional[str]
    expiration: Optional[str]
    unit_weight: Optional[str]
    warn_stock: int
    picture: Optional[str]
    notice: Optional[str]
    fill_period: Optional[str]
    measure: Optional[str]


class ComponentCreate(ComponentBase):
    pass


class SpecificationBase(BaseModel):
    id: Optional[str]
    component_id: str
    vendor_id: Optional[int]
    gross_price: Optional[float]
    net_price: Optional[float]
    stock: int = 0
    blueprint: Optional[str]
    notice: Optional[str]


class SpecificationCreate(SpecificationBase):
    pass


class Specification(SpecificationBase):
    vendor: Optional[Vendor]

    class Config:
        orm_mode = True


class Component(ComponentBase):
    specification: Optional[List[Specification]]

    class Config:
        orm_mode = True


class CompoCategoryBase(BaseModel):
    category: str
    prefix: str


class CompoCategoryCreate(CompoCategoryBase):
    pass


class CompoCategory(CompoCategoryBase):
    id: int

    class Config:
        orm_mode = True


class BuyerBase(BaseModel):
    name: str
    company: str
    payment_period: Optional[str]
    contact: str
    address: Optional[str]
    notice: Optional[str]


class BuyerCreate(BuyerBase):
    pass


class Buyer(BuyerBase):
    id: int

    class Config:
        orm_mode = True


class ProcessComponentBase(BaseModel):
    id: Optional[int]
    process_id: Optional[str]
    component_id: str
    attrition_rate: float = 0.001
    consumption: int = 1


class ProcessComponentCreate(ProcessComponentBase):
    pass


class ProcessComponent(ProcessComponentBase):
    component: Optional[Component]

    class Config:
        orm_mode = True


class ProcessBase(BaseModel):
    id: Optional[str]
    process_name: str
    product_id: Optional[str]
    process_order: int
    notice: Optional[str]
    unit_pay: float
    process_component: Optional[List[ProcessComponent]]


class ProcessCreate(ProcessBase):
    pass


class Process(ProcessBase):

    class Config:
        orm_mode = True


class ProductBase(BaseModel):
    id: str
    name: str
    category: str
    description: Optional[str]
    inventory: int
    picture: Optional[str]
    custom: Optional[str]
    notice: Optional[str]
    deprecated: bool = False
    deprecated_date: Optional[datetime]
    process: Optional[List[Process]]


class ProductCreate(ProductBase):
    pass


class Product(ProductBase):
    class Config:
        orm_mode = True


class WarehouseRecordBase(BaseModel):
    batch_process_id: int
    component_id: str
    component_name: str
    specification_id: Optional[str]
    consumption: int = 1
    specification_net_price: float
    specification_gross_price: float


class WarehouseRecordCreate(WarehouseRecordBase):
    pass


class WarehouseRecord(WarehouseRecordBase):
    id: int

    class Config:
        orm_mode = True


class WorkSpecificationBase(BaseModel):
    work_id: int
    specification_id: str
    plan_amount: int
    actual_amount: int = 0
    component_name: str
    specification_net_price: Optional[float]
    specification_gross_price: Optional[float]


class WorkSpecificationCreate(WorkSpecificationBase):
    pass


class WorkSpecification(WorkSpecificationBase):
    id: int

    class Config:
        orm_mode = True


class WorkBase(BaseModel):
    batch_process_id: int
    employee_id: int
    employee_name: str
    work_date: datetime
    unit_pay: Optional[float]
    complete_unit: Optional[int]
    hour_pay: Optional[float]
    complete_hour: Optional[int]
    plan_unit: int
    check: bool
    salary_id: Optional[int]
    product_name: str
    process_name: str


class WorkCreate(WorkBase):
    pass


class Work(WorkBase):
    id: int
    work_specification: Optional[List[WorkSpecification]]

    class Config:
        orm_mode = True


class BatchProcessBase(BaseModel):
    status: str
    process_id: str
    batch_id: int
    start_amount: Optional[int]
    end_amount: Optional[int]
    unit_pay: float


class BatchProcessCreate(BatchProcessBase):
    pass


class BatchProcess(BatchProcessBase):
    id: int
    work: Optional[List[Work]]
    process: Optional[Process]
    warehouse_record: Optional[List[WarehouseRecord]]

    class Config:
        orm_mode = True


class BatchBase(BaseModel):
    id: Optional[int]
    status: str
    product_id: str
    plan_amount: int
    actual_amount: Optional[int]
    create: datetime
    start: datetime
    end: Optional[datetime]
    ship: Optional[datetime]
    notice: Optional[str]


class BatchCreate(BatchBase):
    pass


class Batch(BatchBase):
    batch_process: Optional[List[BatchProcess]]

    class Config:
        orm_mode = True


class DeliveryBase(BaseModel):
    product_id: str
    amount: int
    order_id: Optional[str]
    buyer_id: int
    deliver_date: datetime
    unit_price: float
    total_price: float
    notice: Optional[str]


class DeliveryCreate(DeliveryBase):
    pass


class Delivery(DeliveryBase):
    id: int
    buyer: Optional[Buyer]

    class Config:
        orm_mode = True
        
        
class OperationBase(BaseModel):
    content: str
    operator: str
    execute_time: datetime
    

class OperationCreate(OperationBase):
    pass


class Operation(OperationBase):
    id: int

    class Config:
        orm_mode = True
        
        
class EmployeeBase(BaseModel):
    name: str
    gender: str
    birth: Optional[datetime]
    phone: str
    ssn: Optional[str]
    department: Optional[str]
    status: str
    onboard: Optional[datetime]
    notice: Optional[str]
    last_pay_check: Optional[datetime]


class EmployeeCreate(EmployeeBase):
    pass


class Employee(EmployeeBase):
    id: int

    class Config:
        orm_mode = True



class DayInvoiceBase(BaseModel):
    batch_id: int
    process_name: str
    employee_id: int
    employee_name: Optional[str]
    work_date: datetime
    unit_pay: Optional[float]
    complete_unit: Optional[int]
    hour_pay: Optional[float]
    complete_hour: Optional[int]
    check_status: bool = False
    check_date: Optional[datetime]


class DayInvoiceCreate(DayInvoiceBase):
    pass


class DayInvoice(DayInvoiceBase):
    id: int
    salary_id: Optional[int]

    class Config:
        orm_mode = True


class SalaryBase(BaseModel):
    employee_id: int
    employee_name: str
    start_date: datetime
    end_date: datetime
    unit_salary: Optional[float]
    hour_salary: Optional[float]
    deduction: float = 0
    bonus: float = 0
    status: str
    notice: Optional[str]
    check_date: Optional[datetime]


class SalaryCreate(SalaryBase):
    pass


class Salary(SalaryBase):
    id: int
    # work: Optional[List[Work]]
    day_invoice: Optional[List[DayInvoice]]

    class Config:
        orm_mode = True


class UserBase(BaseModel):
    username: str
    disabled: bool = False
    role: str


class User(UserBase):
    hashed_pwd: str

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str = None


