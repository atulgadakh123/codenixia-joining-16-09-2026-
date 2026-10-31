
from pydantic import BaseModel, Field
from datetime import date


class LeaveCreate(BaseModel):
    employee_id: int
    start_date: date
    end_date: date
    reason: str = Field(min_length=1, max_length=500)


class LeaveStatusUpdate(BaseModel):
    status: str
    reply_reason: str = Field(min_length=1, max_length=500)
