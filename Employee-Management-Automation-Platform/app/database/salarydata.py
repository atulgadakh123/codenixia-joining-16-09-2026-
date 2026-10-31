from database.userdata import get_connection
from database.paymentdata import pending_balence, calculate_balance
from database.attendance import total_attendance

def create_salary():
    conn = get_connection()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS salary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER,
            month TEXT,
            base_salary REAL,
            total_days INTEGER,
            final_salary REAL,
            amount_paid REAL DEFAULT 0,
            pending_payment REAL,
            generated_date TEXT DEFAULT CURRENT_DATE,
            generated_time TEXT DEFAULT (TIME('now', 'localtime'))
        )
    """)

    conn.commit()
    conn.close()

def insert_salary(employee_id, month, base_salary, total_days,
                  final_salary, amount_paid, pending_payment):

    conn = get_connection()

    conn.execute("""
        INSERT INTO salary (
            employee_id,
            month,
            base_salary,
            total_days,
            final_salary,
            amount_paid,
            pending_payment
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        employee_id,
        month,
        base_salary,
        total_days,
        final_salary,
        amount_paid,
        pending_payment
    ))

    conn.commit()
    conn.close()
    return {
    "message": "Salary generated successfully",
    "employee_id": employee_id,
    "month": month,
    "final_salary": final_salary,
    "amount_paid": amount_paid,
    "pending_payment": pending_payment
}

def generate_salary(employee_id, month):
    conn = get_connection()

    employee = conn.execute("""
        SELECT salary
        FROM employee
        WHERE id = ?
    """, (employee_id,)).fetchone()

    conn.close()

    if employee is None:
        return {"error": "Employee not found"}

    total_salary = calculate_balance(employee_id)
    total_days = total_attendance(employee_id,month)["present"]
    print("total_days:", total_days, type(total_days))
    payment = pending_balence(employee_id)

    amount_paid = payment["amount_paid"] if payment else 0
    pending_payment = payment["balance"] if payment else total_salary

    sleep= insert_salary(
        employee_id,
        month,
        employee["salary"],
        total_days,
        total_salary,
        amount_paid,
        pending_payment
    )
    return sleep