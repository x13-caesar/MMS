from sqlalchemy import create_engine
from bean import Vendor
from sqlalchemy.orm import sessionmaker
from dao import VendorDao
from environment import mysql_local



# c1 = Vendor(id='2',
#             name='李四',
#             company='李四拖拉机厂',
#             address='Station Road Nanded',
#             notice='ravi@gmail.com')
#
# session.add(c1)
# session.commit()


engine = create_engine(mysql_local.address, echo=True)
Session = sessionmaker(bind=engine)
session = Session()

vendorDao = VendorDao(session)

def get_vendors():
    return vendorDao.get_vendors()