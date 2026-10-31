from database.userdata import get_connection
import csv
from pathlib import Path
from datetime import date, datetime


def add_attendance_csv(employee_id, status):
    conn = get_connection()

    employee = conn.execute(
        "SELECT name FROM employee WHERE id = ?",
        (employee_id,)
    ).fetchone()

    conn.close()

    if employee is None:
        return

    employee_name = employee["name"]
    file_path = Path("attendance.csv")
    file_exists = file_path.exists()

    with open(file_path, "a", newline="") as file:
        writer = csv.DictWriter(
            file,
            fieldnames=[
                "employee_id", "employee_name",
                "date", "time", "status"
            ]
        )

        if not file_exists:
            writer.writeheader()

        writer.writerow({
            "employee_id": employee_id,
            "employee_name": employee_name,
            "date": date.today(),
            "time": datetime.now().strftime("%H:%M:%S"),
            "status": status
        })