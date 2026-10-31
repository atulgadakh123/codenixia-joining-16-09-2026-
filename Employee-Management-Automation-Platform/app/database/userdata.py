import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
DB_PATH = BASE_DIR / "data" / "user.db"

def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection

#create table 
def create_user():
    connection =get_connection()
    connection.execute("""
    CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email  TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL
        )
        
        """
    )
    connection.commit()
    connection.close()

def insert_user(name,email,password,role):
    connection =get_connection()
    connection.execute(""" INSERT INTO users
       ( name,email,password,role ) VALUES(?,?,?,?)
        """,(name,email,password,role))

    connection.commit()
    connection.close()

def login_user(email, password):
    conn = get_connection()

    cursor = conn.execute("""
        SELECT * FROM users
        WHERE email = ? AND password = ?
    """, (email, password))

    user = cursor.fetchone()
    conn.close()

    if user:
        return {"message": "Login successful"}

    return {"message": "Invalid email and password"}

def get_user_by_email(email):
    conn = get_connection()

    user = conn.execute(
        "SELECT * FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    conn.close()
    return user

def get_user():
    conn = get_connection()
    cursor = conn.execute(
        """SELECT * FROM users
            ORDER BY id DESC
        """
    )
    users=cursor.fetchall()
    conn.close
    return users

def delete_user(id):
    conn = get_connection()
    cursor = conn.execute(
        "DELETE FROM users WHERE id = ?",
        (id,)
    )
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted