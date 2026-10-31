from pydantic import BaseModel, Field
from typing import Literal


class AttendanceCreate(BaseModel):
    employee_id: int
   # status: Literal["Present", "Absent"]

class AttendanceMonthFilter(BaseModel):
    month: int = Field(ge=1, le=12)
    year: int = Field(ge=2000, le=2100)