from fastapi import APIRouter,Depends,HTTPException
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials #OAuth2PasswordBearer
from core.security import verify_access_token
from database.employeedata import (insert_employeedata,
                                   get_employee_by_id,
                                   list_employee,
                                   delete_employee,
                                   update_employee)
from schemas.employeeSchema import employee_create,employee_update


router = APIRouter(prefix="/employee",tags=["employee Management"])

#oauth2_scheme = OAuth2PasswordBearer(
 #   tokenUrl="/employee/login"
#)
sequrity =HTTPBearer()
def get_current_user(credentials:HTTPAuthorizationCredentials=Depends(sequrity)):
    token = credentials.credentials
    payload =verify_access_token(token)

    if payload is None or not payload.get("sub"):
        raise HTTPException(
            status_code=401,
            detail="invalid or expired token",
            headers={"WWW-Authenticate":"Bearer"}
        )
    return payload

@router.post("/employee")
def create_employee(employee:employee_create, current_user:dict=Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="only admin can create employee"
        )
    insert_employeedata(
        employee.name,
        employee.email,
        employee.phone,
        employee.department,
        employee.designation,
        employee.joining_date,
        employee.salary
    )
    return{"message":"employee data sucessfull created"}

@router.get("/list_all")
def get_all_employees():
    return list_employee()

@router.get("/get/{id}")
def ge_employeeid(id:int):
    employee = get_employee_by_id(id)
    if employee is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )
    return employee


@router.put("/update/{id}")
def update_employeee(id:int,employee:employee_update, current_user:dict=Depends(get_current_user)):
    if current_user.get("role") != "admin":
      raise  HTTPException(status_code=403,
                      detail="only admin can updated")
    employee_data = get_employee_by_id(id)

    if employee_data is None:
      raise HTTPException(
        status_code=404,
        detail="Employee not found"
    )
    update_employee(
        id,
        employee.name,
        employee.email,
        employee.phone,
        employee.department,
        employee.designation,
        employee.joining_date,
        employee.salary
    )
    return {"message": "Employee updated successfully"}


@router.delete("/delete/{id}")
def employee_delete(id:int, current_user:dict=Depends(get_current_user)):
    if current_user.get("role") != "admin":
          raise  HTTPException(status_code=403,
                          detail="only admin can updated")
    employee = delete_employee(id)
    if employee is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )
    delete_employee(id)
    return{
        "employee":employee,
        "message":"data sucessfull deleted"
    }

