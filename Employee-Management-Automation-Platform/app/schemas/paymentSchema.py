from pydantic import BaseModel,Field
from typing import Literal


class CreatePayment(BaseModel):
   employee_id:int
   #total_salary:float
   amount_paid:float=Field(ge=0)
  # balance:float 
   #month :int
   #year:int
   payment_status: Literal["pending", "paid"] 