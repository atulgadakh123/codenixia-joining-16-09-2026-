from fastapi import APIRouter,Depends,HTTPException

from database.salarydata import generate_salary

from schemas.salarySchema import SalaryCreate

from routes.employeeRoutes import get_current_user
salary = APIRouter(
    prefix="/salary",
    tags=["Salary Management"]
)


@salary.post("/generate")
def create_salary(
    data: SalaryCreate,
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="only admin can generate salary"
        )

    employee = generate_salary(
        data.employee_id,
        data.month
    )

    # if employee is None:
    #     raise HTTPException(
    #         status_code=404,
    #         detail="Employee not found"
    #     )
    

    return employee



