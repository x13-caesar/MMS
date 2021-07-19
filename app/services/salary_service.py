from sqlalchemy.orm import Session

from fastapi.encoders import jsonable_encoder
from .. import models, schemas

from datetime import datetime


def get_salary(salary_id: int, db: Session):
    return db.query(models.Salary).filter(models.Salary.id == salary_id).first()


def get_salaries(db: Session):
    return db.query(models.Salary).all()


def get_salaries_by_status(status: str, db: Session):
    return db.query(models.Salary).filter(models.Salary.status == status).all()


def get_salaries_by_employee_id(employee_id: int, db: Session):
    return db.query(models.Salary).filter(models.Salary.employee_id == employee_id).all()


def get_salaries_in_month_range(after: datetime, before: datetime, db: Session):
    return db.query(models.Employee).filter(models.Employee.month >= after,
                                            models.Employee.month <= before).all()


def create_salary(salary: schemas.SalaryCreate, db: Session):
    new_salary = models.Salary(**salary.dict())
    db.add(new_salary)
    db.commit()
    db.refresh(new_salary)
    return new_salary


def update_salary(salary: schemas.Salary, db: Session):
    updated_salary = models.Salary(**salary.dict())
    db.query(models.Salary). \
        filter(models.Salary.id == updated_salary.id). \
        update(jsonable_encoder(updated_salary))
    db.commit()
    return db.query(models.Salary).filter(models.Salary.id == updated_salary.id).first()


def delete_salary(salary: schemas.Salary, db: Session):
    db.query(models.Salary). \
        filter(models.Salary.id == salary.id). \
        delete(synchronize_session="fetch")
    db.commit()
    return
