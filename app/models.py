from sqlalchemy import Column, Date, DateTime, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from .database import Base


class Vendor(Base):
    __tablename__ = 'vendor'

    id = Column(Integer, primary_key=True)
    name = Column(String)
    company = Column(String)
    payment_period = Column(String)
    contact = Column(String)
    address = Column(String)
    notice = Column(String)


class Component(Base):
    __tablename__ = 'component'

    id = Column(String, primary_key=True)
    name = Column(String)
    category = Column(String)
    material = Column(String)
    description = Column(String)
    expiration = Column(String)
    unit_weight = Column(String)
    warn_stock = Column(Integer)
    picture = Column(String)
    notice = Column(String)


class Specification(Base):
    __tablename__ = 'specification'

    id = Column(String, primary_key=True)
    component_id = Column(Integer, ForeignKey('component.id'))
    vendor_id = Column(Integer, ForeignKey('vendor.id'))
    gross_price = Column(Float)
    net_price = Column(Float)
    stock = Column(Integer)
    blueprint = Column(String)
    notice = Column(String)
    component = relationship('Component', back_populates='specification')
    vendor = relationship("Vendor", back_populates="specification")


Component.specification = relationship("Specification",
                                       order_by=Specification.id,
                                       back_populates="component")

Vendor.specification = relationship("Specification",
                                    order_by=Specification.id,
                                    back_populates="vendor")


class Buyer(Base):
    __tablename__ = 'buyer'

    id = Column(Integer, primary_key=True)
    name = Column(String)
    company = Column(String)
    payment_period = Column(String)
    contact = Column(String)
    address = Column(String)
    notice = Column(String)


class Product(Base):
    __tablename__ = 'product'

    id = Column(Integer, primary_key=True)
    name = Column(String)
    category = Column(String)
    description = Column(String)
    last_produce = Column(DateTime)
    inventory = Column(Integer)
    picture = Column(String)
    notice = Column(String)


class Process(Base):
    __tablename__ = 'process'

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey('product.id'))
    process_name = Column(String)
    process_order = Column(Integer)
    notice = Column(String)
    product = relationship('Product', back_populates='process')


Product.process = relationship("Process",
                               order_by=Process.id,
                               back_populates="product")


class ProcessComponent(Base):
    __tablename__ = 'process_component'

    id = Column(Integer, primary_key=True)
    process_id = Column(Integer, ForeignKey('process.id'))
    component_id = Column(String, ForeignKey('component.id'))
    attrition_rate = Column(Float)
    process = relationship('Process', back_populates='process_component')
    component = relationship('Component', back_populates='process_component')


Process.process_component = relationship("ProcessComponent",
                                         order_by=ProcessComponent.id,
                                         back_populates="process")

Component.process_component = relationship("ProcessComponent",
                                           order_by=ProcessComponent.id,
                                           back_populates="component")

class Batch(Base):
    __tablename__ = 'batch'

    id = Column(Integer, primary_key=True)
    status = Column(String)
    product_id = Column(Integer, ForeignKey('product.id'))
    plan_amount = Column(Integer)
    actual_amount = Column(Integer)
    create = Column(DateTime)
    start = Column(DateTime)
    end = Column(DateTime)
    ship = Column(DateTime)
    notice = Column(String)
    product = relationship('Product', back_populates='batch')


Product.batch = relationship("Batch",
                             order_by=Batch.id,
                             back_populates="product")


class BatchProcess(Base):
    __tablename__ = 'batch_process'

    id = Column(Integer, primary_key=True)
    status = Column(String)
    process_id = Column(Integer, ForeignKey('process.id'))
    batch_id = Column(Integer, ForeignKey('batch.id'))
    start_amount = Column(Integer)
    end_amount = Column(Integer)
    process = relationship('Process', back_populates='batch_process')
    batch = relationship('Batch', back_populates='batch_process')


Batch.batch_process = relationship("BatchProcess",
                                   order_by=BatchProcess.id,
                                   back_populates="batch")

Process.batch_process = relationship("BatchProcess",
                                     order_by=BatchProcess.id,
                                     back_populates="process")

class Delivery(Base):
    __tablename__ = 'delivery'

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey('product.id'))
    amount = Column(Integer)
    order_id = Column(String)
    buyer_id = Column(Integer, ForeignKey('buyer.id'))
    deliver_date = Column(DateTime)
    unit_price = Column(Float)
    total_price = Column(Float)
    notice = Column(String)
    product = relationship("Product", back_populates="delivery")
    buyer = relationship("Buyer", back_populates="delivery")


Product.delivery = relationship("Delivery",
                                     order_by=Delivery.id,
                                     back_populates="product")


Buyer.delivery = relationship("Delivery",
                                     order_by=Delivery.id,
                                     back_populates="buyer")


class Operation(Base):
    __tablename__ = 'operation'

    id = Column(Integer, primary_key=True)
    content = Column(String)
    operator = Column(String)
    execute_time = Column(DateTime)


class Employee(Base):
    __tablename__ = 'employee'

    id = Column(Integer, primary_key=True)
    name = Column(String)
    gender = Column(String)
    birth = Column(DateTime)
    phone = Column(String)
    ssn = Column(String)
    department = Column(String)
    status = Column(String)
    onboard = Column(DateTime)
    notice = Column(String)


class Salary(Base):
    __tablename__ = 'salary'

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey('employee.id'))
    month = Column(DateTime)
    unit_salary = Column(Float)
    hour_salary = Column(Float)
    deduction = Column(Float)
    bonus = Column(Float)
    status = Column(String)


class Work(Base):
    __tablename__ = 'work'

    id = Column(Integer, primary_key=True)
    batch_process_id = Column(Integer, ForeignKey('batch_process.id'))
    employee_id = Column(Integer, ForeignKey('employee.id'))
    work_date = Column(DateTime)
    unit_pay = Column(Float)
    complete_unit = Column(Integer)
    hour_pay = Column(Float)
    complete_hour = Column(Integer)


class WorkSpecification(Base):
    __tablename__ = 'work_specification'

    id = Column(Integer, primary_key=True)
    work_id = Column(Integer, ForeignKey('work.id'))
    specification_id = Column(Integer, ForeignKey('specification.id'))
    plan_amount = Column(Integer)
    actual_amount = Column(Integer)
    specification = relationship("Specification", back_populates="work_specification")


WorkSpecification.specification = relationship("Specification",
                                               order_by=Specification.id,
                                               back_populates="workSpecification")


Specification.workSpecification = relationship("WorkSpecification",
                                               order_by=WorkSpecification.id,
                                               back_populates="specification")
