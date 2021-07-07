from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Vendor(Base):
    __tablename__ = 'vendor'

    id = Column(Integer, primary_key=True)
    name = Column(String)
    company = Column(String)
    payment_period = Column(String)
    contact = Column(String)
    address = Column(String)
    notice = Column(String)

    def to_json(self):
        return {str(c.name): str(getattr(self, c.name)) for c in self.__table__.columns}


class Component(Base):
    __tablename__ = 'component'

    id = Column(Integer, primary_key=True)
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

    id = Column(Integer, primary_key=True)
    component_id = Column(Integer, ForeignKey('component.id'))
    vendor_id = Column(Integer, ForeignKey('vendor.id'))
    gross_price = Column(Float)
    net_price = Column(Float)
    stock = Column(Integer)
    blue_print = Column(String)
    notice = Column(String)
    component = relationship('Component', back_populates='specification')
    vendor = relationship("Vendor", back_populates="specification")


Component.specification = relationship("Specification",
                                       order_by=Specification.id,
                                       back_populates="component")

Vendor.specification = relationship("Specification",
                                    order_by=Specification.id,
                                    back_populates="vendor")
