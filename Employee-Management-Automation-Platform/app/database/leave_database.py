
from database.userdata import get_connection
from datetime import date


def create_leave_table():
    conn = get_connection()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS leave_request (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            send_date TEXT NOT NULL DEFAULT CURRENT_DATE,
            reason TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            reply_date TEXT,
            reply_reason TEXT,
            FOREIGN KEY (employee_id) REFERENCES employee(id)
        )
    """)

    conn.commit()
    conn.close()


def insert_leave(employee_id, start_date, end_date, reason):
    conn = get_connection()

    employee = conn.execute(
        "SELECT id FROM employee WHERE id = ?",
        (employee_id,)
    ).fetchone()

    if employee is None:
        conn.close()
        return False

    conn.execute("""
        INSERT INTO leave_request (
            employee_id, start_date, end_date, reason
        )
        VALUES (?, ?, ?, ?)
    """, (employee_id, start_date, end_date, reason))

    conn.commit()
    conn.close()
    return True


def update_leave_status(leave_id, status, reply_reason):
    conn = get_connection()

    cursor = conn.execute("""
        UPDATE leave_request
        SET status = ?,
            reply_date = ?,
            reply_reason = ?
        WHERE id = ?
    """, (status, str(date.today()), reply_reason, leave_id))

    conn.commit()
    updated = cursor.rowcount
    conn.close()

    return updated > 0


def leave_history(request_date):
    conn = get_connection()

    cursor = conn.execute("""
        SELECT *
        FROM leave_request
        WHERE send_date = ?
        ORDER BY id DESC
    """, (request_date,))

    leaves = cursor.fetchall()
    conn.close()

    return leaves


def delete_leave(leave_id):
    conn = get_connection()

    cursor = conn.execute("""
        DELETE FROM leave_request
        WHERE id = ?
    """, (leave_id,))

    conn.commit()
    deleted = cursor.rowcount
    conn.close()

    if deleted == 0:
        return False

    return True
