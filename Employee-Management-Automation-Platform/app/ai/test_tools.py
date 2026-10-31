
from ai.tools import (
    get_employee_profile,
    get_attendance,
    get_salary_status,
    get_payment_status,
)

employee_id = int(input("Enter employee ID: "))

print("\n--- Employee Profile ---")
print(get_employee_profile(employee_id))

print("\n--- Attendance ---")
print(get_attendance(employee_id))

print("\n--- Salary ---")
print(get_salary_status(employee_id))

print("\n--- Payments ---")
print(get_payment_status(employee_id))
