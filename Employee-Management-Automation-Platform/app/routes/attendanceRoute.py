from fastapi import APIRouter,Query, HTTPException
from database.csv_attendance import add_attendance_csv

from database.attendance import (
    insert_attendance,
    list_attendance,
    employee_attendance,
    total_attendance,
    attendance_percentage,
    end_attendance,
    alter_table
    
)

from schemas.attendanceSchema import AttendanceCreate,AttendanceMonthFilter


attendance = APIRouter(
    prefix="/attendance",
    tags=["Attendance Management"]
)


# Add attendance
@attendance.post("/add")
def add_attendance(data: AttendanceCreate):
    
    return insert_attendance(
        data.employee_id,
        #data.status
    )


# Get all attendance
@attendance.get("/all")
def get_all_attendance(
    month: int | None = Query(None, ge=1, le=12),
    year: int | None = Query(None, ge=2000, le=2100),
    date: str | None = Query(None)
):
    return list_attendance(month, year, date)

# Get employee attendance
@attendance.get("/{employee_id}")
def get_employee_attendance( employee_id: int,
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000, le=2100)
):

    return employee_attendance(employee_id,month,year)


# Total attendance
@attendance.get("/total/{employee_id}")
def get_total_attendance( employee_id: int,
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000, le=2100)
):
    return total_attendance(employee_id,month,year)


# Attendance percentage
@attendance.get("/percentage/{employee_id}")
def get_attendance_percentage(employee_id: int):

    return attendance_percentage(employee_id)


@attendance.post("/end_attendance/{employee_id}")
def end_time(employee_id: int, description: str):
    return end_attendance(employee_id, description)


@attendance.post("/add-csv")
def add_attendance_csv_api(data: AttendanceCreate):
    return add_attendance_csv(
        data.employee_id,
        data.status
    )


@attendance.post("/ addcolume")
def add_column():
    return alter_table()