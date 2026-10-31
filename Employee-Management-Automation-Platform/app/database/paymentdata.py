#import sqlite
from database.userdata import get_connection
from database.attendance import total_attendance
from database.employeedata import get_employee_by_id
from datetime import datetime, date, time

def create_pament():
    conn = get_connection ()
    conn.execute("""
                CREATE TABLE IF NOT EXISTS payment(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    employee_id INTEGER ,
                    amount_paid FLOAT NOT NULL,
                    balance FLOAT NOT NULL,
                    total_salary FLOAT NOT NULL,
                    payment_date TEXT NOT NULL DEFAULT CURRENT_DATE,
                    payment_status TEXT NOT NULL
                )
        """)
    conn.commit()
    conn.close()

    #insert payment
def insert_payment(employee_id,total_salary,amount_paid,balance,payment_status):
    employee = get_employee_by_id(employee_id)
    if employee is None:
            return{"message":"Employee not found"}
    
    conn = get_connection()
    conn.execute("""INSERT INTO payment(
                    employee_id,total_salary,amount_paid,balance,payment_status)
                    VALUES(?,?,?,?,?)
        """,(employee_id,total_salary,amount_paid,balance,payment_status))

    conn.commit()
    conn.close()


#show payament
def payment_history():
    conn =get_connection()
    cursor =conn.execute("SELECT * FROM payment ORDER BY id DESC")
    rows= cursor.fetchall()
    conn.close()
    return [dict(row)for row in rows]


def calculate_balance(employee_id):
    employee = get_employee_by_id(employee_id)
    if employee is None:
            return{"message":"Employee not found"}
    conn = get_connection()

    result = conn.execute("""
        SELECT
            employee.salary,
            COUNT(attendance.id) AS total_attendance
        FROM employee
        JOIN attendance
            ON employee.id = attendance.employee_id
        WHERE employee.id = ?
          AND attendance.status = 'present'
          
        GROUP BY employee.id
    """, (employee_id,)).fetchone()

    print("Employee ID:", employee_id)
    print("Result:", result)

    if result is None:
        conn.close()
        return 0

    daily_salary = result["salary"] / 30
    total_salary = round(daily_salary * result["total_attendance"], 2)

    print("Daily Salary:", daily_salary)
    print("Total Attendance:", result["total_attendance"])
    print("Total Salary:", total_salary)
    conn.execute("""
    UPDATE payment
    SET total_salary = ?
    WHERE employee_id = ?
    """, (total_salary, employee_id))

    conn.commit()
    conn.close()
    return total_salary


def pending_balence(employee_id):
    employee = get_employee_by_id(employee_id)
    if employee is None:
            return{"message":"Employee not found"}
    conn = get_connection()

    cursor = conn.execute("""
        SELECT total_salary, amount_paid
        FROM payment
        WHERE employee_id = ?
    """, (employee_id,))

    payments = cursor.fetchall()

    if not payments:
        conn.close()
        return None

    total_salary = payments[-1]["total_salary"]
    total_amount = sum(p["amount_paid"] for p in payments)

    balance = round(total_salary - total_amount, 2)

    print("Total Amount Paid:", total_amount)
    print("Total Salary:", total_salary)
    print("Balance:", balance)

    conn.execute("""
        UPDATE payment
        SET balance = ?
        WHERE employee_id = ?
    """, (balance, employee_id))

    conn.commit()
    conn.close()

    return balance

def payment_summary(employee_id, month, year):
    employee = get_employee_by_id(employee_id)
    if employee is None:
            return{"message":"Employee not found"}
    
    conn = get_connection()

    cursor = conn.execute("""
        SELECT
            employee.id AS employee_id,
            employee.name,
            employee.email,
            employee.joining_date,
            payment.total_salary,
            SUM(payment.amount_paid) AS amount_paid,
            payment.balance,
            payment.payment_date,
            payment.payment_status
        FROM employee
        JOIN payment
            ON employee.id = payment.employee_id
        WHERE employee.id = ?
            AND strftime('%m', payment.payment_date) = printf('%02d', ?)
            AND strftime('%Y', payment.payment_date) = ?
        GROUP BY employee.id
    """, (employee_id,month,str(year)))
          
    summary = cursor.fetchone()
    print("Employee ID:", employee_id)
    print("Month:", month)
    print("Year:", year)
    print("Summary:", summary)
    attendance = total_attendance(employee_id, month, year)

    conn.close()

    if summary is None:
        return None

    result = dict(summary)
    result["present_days"] = attendance["present"]
    result["absent_days"] = attendance["absent"]

    return result