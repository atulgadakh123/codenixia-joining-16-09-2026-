from routes.employeeRoutes import (
    get_all_employees,
    get_employee_by_id
)

from routes.paymentRoute import (
    list_all,
    calculate,
    pending,
    summary
)

from routes.attendanceRoute import(
   get_all_attendance,
   get_employee_attendance,
   get_total_attendance,
   end_time
)
from database.userdata import get_connection

def search_employee(search_text:str):
    conn = get_connection()

    cursor = conn.execute("""
        SELECT id, name, email, phone, department,
                        designation, joining_date, salary
        FROM employee
        WHERE name LIKE ?
           OR email LIKE ?
           OR department LIKE ?
           OR designation LIKE ?
    """,(f"%{search_text}%",
        f"%{search_text}%",
        f"%{search_text}%",
        f"%{search_text}%"))

    result = cursor.fetchall()

    conn.close()

    return result

def compare_employees(employee_id_1: int, employee_id_2: int):
    employee_1 = get_employee_by_id(employee_id_1)
    employee_2 = get_employee_by_id(employee_id_2)

    if employee_1 is None:
        return {"error": f"Employee {employee_id_1} not found"}

    if employee_2 is None:
        return {"error": f"Employee {employee_id_2} not found"}

    return {
        "employee_1": dict(employee_1),
        "employee_2": dict(employee_2)
    }