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
    name: str
    category: str
    material: Optional[str]
    description: Optional[str]
    expiration: Optional[str]
    unit_weight: Optional[str]
    warn_stock: int = 1
    picture: Optional[str]
    notice: Optional[str]


class ComponentCreate(ComponentBase):
    pass


class Component(ComponentBase):
    id: str

    class Config:
        orm_mode = True


class SpecificationBase(BaseModel):
    component_id: str
    vendor_id: Optional[int]
    gross_price: float
    net_price: float
    stock: int = 0
    blue_print: Optional[str]
    notice: Optional[str]


class SpecificationCreate(SpecificationBase):
    pass


class Specification(SpecificationBase):
    id: str
    component: Component
    vendor: Vendor

    class Config:
        orm_mode = True


class BuyerBase(BaseModel):
    name : str
    company: str
    payment_period: str
    contact: str
    address: str
    notice: str


class BuyerCreate(BuyerBase):
    pass


class Buyer(BuyerBase):
    id: int

    class Config:
        orm_mode = True


class ProductBase(BaseModel):
    name: str
    category: str
    description: str
    last_produce: datetime
    inventory: int
    picture: str
    notice: str


class ProductCreate(ProductBase):
    pass


class Product(ProductBase):
    id: int

    class Config:
        orm_mode = True


class ProcessBase(BaseModel):
    process_name: str
    product_id: int
    process_order: int
    notice: str


class ProcessCreate(ProcessBase):
    pass


class Process(ProcessBase):
    id: int

    class Config:
        orm_mode = True


class ProcessComponentBase(BaseModel):
    process_id: int
    component_id: str
    attrition_rate: float


class ProcessComponentCreate(ProcessComponentBase):
    pass


class ProcessComponent(ProcessComponentBase):
    id: int

    class Config:
        orm_mode = True
        

class BatchBase(BaseModel):
    status: str
    product_id: int
    plan_amount: int
    actual_amount: int
    create: datetime
    start: datetime
    end: datetime
    ship: datetime
    notice: str


class BatchCreate(BatchBase):
    pass


class Batch(BatchBase):
    id: int

    class Config:
        orm_mode = True


class BatchProcessBase(BaseModel):
    status: str
    process_id: int
    batch_id: int
    start_amount: int
    end_amount: int


class BatchProcessCreate(BatchProcessBase):
    pass


class BatchProcess(BatchProcessBase):
    id: int

    class Config:
        orm_mode = True


class DeliveryBase(BaseModel):
    product_id: int
    amount: int
    order_id: str
    buyer_id: int
    deliver_date: datetime
    unit_price: float
    total_price: float
    notice: str


class DeliveryCreate(DeliveryBase):
    pass


class Delivery(DeliveryBase):
    id: int

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
    birth: datetime
    phone: str
    ssn: str
    department: str
    status: str
    onboard: datetime
    notice: str


class EmployeeCreate(EmployeeBase):
    pass


class Employee(EmployeeBase):
    id: int

    class Config:
        orm_mode = True


class SalaryBase(BaseModel):
    employee_id: int
    month: datetime
    unit_salary: float
    hour_salary: float
    deduction: float
    bonus: float
    status: str


class SalaryCreate(SalaryBase):
    pass


class Salary(SalaryBase):
    id: int

    class Config:
        orm_mode = True


class WorkBase(BaseModel):
    batch_process_id: int
    employee_id: int
    work_date: datetime
    unit_pay: float
    complete_unit: int
    hour_pay: float
    complete_hour: int


class WorkCreate(WorkBase):
    pass


class Work(WorkBase):
    id: int

    class Config:
        orm_mode = True


class WorkSpecificationBase(BaseModel):
    work_id: int
    specification_id: int
    plan_amount: int
    actual_amount: int


class WorkSpecificationCreate(WorkSpecificationBase):
    pass


class WorkSpecification(WorkSpecificationBase):
    id: int

    class Config:
        orm_mode = True


