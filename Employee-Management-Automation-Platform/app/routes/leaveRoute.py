
from fastapi import APIRouter, HTTPException, Query
from datetime import date

from schemas.leave import LeaveCreate, LeaveStatusUpdate
from database.leave_database import (
    insert_leave,
    update_leave_status,
    leave_history,
    delete_leave
)

leave = APIRouter(prefix="/leave", tags=["Leave Management"])


# Apply Leave
@leave.post("/apply")
def apply_leave(request: LeaveCreate):

    if request.end_date < request.start_date:
        raise HTTPException(
            status_code=400,
            detail="End date cannot be before start date"
        )

    result = insert_leave(
        request.employee_id,
        str(request.start_date),
        str(request.end_date),
        request.reason
    )

    if result is False:
        raise HTTPException(
            status_code=404,
            detail="Employee ID not found"
        )

    return {"message": "Leave request submitted successfully"}


# Update Leave Status
@leave.put("/reply/{leave_id}")
def reply_leave(leave_id: int, request: LeaveStatusUpdate):

    if request.status not in ["approved", "rejected"]:
        raise HTTPException(
            status_code=400,
            detail="Status must be approved or rejected"
        )

    result = update_leave_status(
        leave_id,
        request.status,
        request.reply_reason
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found"
        )

    return {"message": "Leave status updated successfully"}


# Get Leave History by Date
@leave.get("/history")
def get_leave_history(request_date: date = Query(..., alias="date")):

    return leave_history(str(request_date))


# Delete Leave
@leave.delete("/{leave_id}")
def remove_leave(leave_id: int):

    result = delete_leave(leave_id)

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found"
        )

    return {"message": "Leave deleted successfully"}
