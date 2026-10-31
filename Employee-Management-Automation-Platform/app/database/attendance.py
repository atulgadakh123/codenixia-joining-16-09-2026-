from datetime import datetime

from database.userdata import get_connection
from database.employeedata import get_employee_by_id


# Create attendance table
def create_attendance():
    conn = get_connection()

    try:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id INTEGER NOT NULL,
                date TEXT NOT NULL DEFAULT CURRENT_DATE,
                time TEXT NOT NULL DEFAULT CURRENT_TIME,
                end_time TEXT,
                working_hours REAL,
                description TEXT,
                status TEXT,
                UNIQUE(employee_id, date)
            )
        """)

        conn.commit()
    finally:
        conn.close()


# Insert attendance
def insert_attendance(employee_id):
    employee = get_employee_by_id(employee_id)

    if employee is None:
        return {"message": "Employee not found"}

    conn = get_connection()

    current_time = datetime.now().strftime("%H:%M:%S")
    current_date = datetime.now().strftime("%Y-%m-%d")

    try:
        conn.execute("""
            INSERT INTO attendance (employee_id, date, time)
            VALUES (?, ?, ?)
        """, (int(employee_id), current_date, current_time))

        conn.commit()

        return {
            "message": "Attendance added successfully",
            "employee_id": int(employee_id),
            "date": current_date,
            "time": current_time
        }

    except Exception as e:
        return {"message": str(e)}

    finally:
        conn.close()


# Get all attendance by date or month/year
def list_attendance(month=None, year=None, date=None):
    conn = get_connection()

    try:
        if date:
            cursor = conn.execute("""
                SELECT *
                FROM attendance
                WHERE date = ?
                ORDER BY time DESC
            """, (date,))

        elif month is not None and year is not None:
            month = int(month)
            year = int(year)

            cursor = conn.execute("""
                SELECT *
                FROM attendance
                WHERE strftime('%m', date) = ?
                  AND strftime('%Y', date) = ?
                ORDER BY date DESC, time DESC
            """, (f"{month:02d}", str(year)))

        else:
            return {
                "message": "Please provide date OR month and year"
            }

        return [dict(row) for row in cursor.fetchall()]

    finally:
        conn.close()


# Get employee attendance
# If month/year are not provided, return today's attendance
def employee_attendance(employee_id, month=None, year=None):
    employee = get_employee_by_id(employee_id)

    if employee is None:
        return {"message": "Employee not found"}

    conn = get_connection()

    try:
        if month is None or year is None:
            cursor = conn.execute("""
                SELECT *
                FROM attendance
                WHERE employee_id = ?
                  AND date = CURRENT_DATE
                ORDER BY time DESC
            """, (int(employee_id),))

        else:
            month = int(month)
            year = int(year)

            cursor = conn.execute("""
                SELECT *
                FROM attendance
                WHERE employee_id = ?
                  AND strftime('%m', date) = ?
                  AND strftime('%Y', date) = ?
                ORDER BY date DESC, time DESC
            """, (
                int(employee_id),
                f"{month:02d}",
                str(year)
            ))

        return [dict(row) for row in cursor.fetchall()]

    finally:
        conn.close()


# Get total attendance
# If month/year are not provided, return today's totals
def total_attendance(employee_id, month=None, year=None):
    employee = get_employee_by_id(employee_id)

    if employee is None:
        return {"message": "Employee not found"}

    conn = get_connection()

    try:
        if month is None or year is None:
            cursor = conn.execute("""
                SELECT
                    COUNT(*) AS total,
                    COALESCE(SUM(
                        CASE WHEN LOWER(status) = 'present'
                        THEN 1 ELSE 0 END
                    ), 0) AS present,
                    COALESCE(SUM(
                        CASE WHEN LOWER(status) = 'absent'
                        THEN 1 ELSE 0 END
                    ), 0) AS absent
                FROM attendance
                WHERE employee_id = ?
                  AND date = CURRENT_DATE
            """, (int(employee_id),))

        else:
            month = int(month)
            year = int(year)

            cursor = conn.execute("""
                SELECT
                    COUNT(*) AS total,
                    COALESCE(SUM(
                        CASE WHEN LOWER(status) = 'present'
                        THEN 1 ELSE 0 END
                    ), 0) AS present,
                    COALESCE(SUM(
                        CASE WHEN LOWER(status) = 'absent'
                        THEN 1 ELSE 0 END
                    ), 0) AS absent
                FROM attendance
                WHERE employee_id = ?
                  AND strftime('%m', date) = ?
                  AND strftime('%Y', date) = ?
            """, (
                int(employee_id),
                f"{month:02d}",
                str(year)
            ))

        return dict(cursor.fetchone())

    finally:
        conn.close()


# Get attendance percentage
def attendance_percentage(employee_id):
    employee = get_employee_by_id(employee_id)

    if employee is None:
        return {"message": "Employee not found"}

    conn = get_connection()

    try:
        cursor = conn.execute("""
            SELECT
                COUNT(*) AS total,
                COALESCE(SUM(
                    CASE WHEN LOWER(status) = 'present'
                    THEN 1 ELSE 0 END
                ), 0) AS present
            FROM attendance
            WHERE employee_id = ?
        """, (int(employee_id),))

        result = cursor.fetchone()

        total = result["total"]
        present = result["present"]

        if total == 0:
            return {"attendance_percentage": 0}

        percentage = (present / total) * 100

        return {
            "attendance_percentage": round(percentage, 2)
        }

    finally:
        conn.close()


# End attendance
def end_attendance(employee_id, description):
    employee = get_employee_by_id(employee_id)

    if employee is None:
        return {"message": "Employee not found"}

    conn = get_connection()

    try:
        cursor = conn.execute("""
            SELECT id, time, end_time
            FROM attendance
            WHERE employee_id = ?
              AND date = CURRENT_DATE
        """, (int(employee_id),))

        attendance = cursor.fetchone()

        if attendance is None:
            return {"message": "Today's attendance not found"}

        if attendance["end_time"] is not None:
            return {"message": "Attendance already ended"}

        end_time = datetime.now().strftime("%H:%M:%S")

        start = datetime.strptime(
            attendance["time"], "%H:%M:%S"
        )
        end = datetime.strptime(
            end_time, "%H:%M:%S"
        )

        working_hours = round(
            (end - start).total_seconds() / 3600, 2
        )

        status = "present" if working_hours > (1 / 60) else "absent"

        conn.execute("""
            UPDATE attendance
            SET end_time = ?,
                working_hours = ?,
                description = ?,
                status = ?
            WHERE id = ?
        """, (
            end_time,
            working_hours,
            description,
            status,
            attendance["id"]
        ))

        conn.commit()

        return {
            "message": "Attendance ended successfully",
            "employee_id": int(employee_id),
            "start_time": attendance["time"],
            "end_time": end_time,
            "working_hours": working_hours,
            "status": status,
            "description": description
        }

    finally:
        conn.close()


# Add status column only if it does not exist
def alter_table():
    conn = get_connection()

    try:
        columns = conn.execute(
            "PRAGMA table_info(attendance)"
        ).fetchall()

        column_names = [column["name"] for column in columns]

        if "status" in column_names:
            return {"message": "Status column already exists"}

        conn.execute("""
            ALTER TABLE attendance
            ADD COLUMN status TEXT
        """)

        conn.commit()

        return {"message": "Status column added successfully"}

    finally:
        conn.close()