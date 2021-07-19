from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .environment import mysql_local
from sqlalchemy.ext.declarative import declarative_base

mysql_engine = create_engine(mysql_local.address, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=mysql_engine)

Base = declarative_base()
