
from fastapi import APIRouter, HTTPException,Query
from datetime import date

#today = date.today()
#month = today.month
#year = today.year

from database.paymentdata import (
    insert_payment,
    payment_history,
    payment_summary,
    pending_balence,
    calculate_balance
)

from schemas.paymentSchema import CreatePayment

payment = APIRouter(
    prefix="/employee",
    tags=["Payment Management"]
)


@payment.post("/payment")
def create_payment(payment: CreatePayment):

    total_salary = calculate_balance(payment.employee_id)

    if total_salary is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    insert_payment(
        payment.employee_id,
        total_salary,
        payment.amount_paid,
        0,
        payment.payment_status
    )

    balance = pending_balence(payment.employee_id)

    return {
        "message": "Payment successfully created",
        "total_salary": total_salary,
        "amount_paid": payment.amount_paid,
        "balance": balance
    }


@payment.get("/get")
def list_all():
    return payment_history()


@payment.get("/total_salary/{employee_id}")
def calculate(employee_id: int):

    # Fetch total salary
    total_salary = calculate_balance(employee_id)

    if total_salary is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    # Fetch balance from database
    balance = pending_balence(employee_id)

    if balance is None:
        raise HTTPException(
            status_code=404,
            detail="Balance not found"
        )

    return {
        "total_salary": total_salary,
        "balance": balance
    }


@payment.get("/pending/{employee_id}")
def pending(employee_id: int):

    employee = pending_balence(employee_id)

    if employee is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return employee


@payment.get("/salary-slip/{employee_id}")
def summary(employee_id: int,
            month:int =Query(...,ge=1,le=12),
            year:int=Query(...)):

    employee = payment_summary(employee_id,month,year)

    if employee is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return employee
