from pydantic import BaseModel


class SalaryCreate(BaseModel):
    employee_id: int
    month: str