
import sqlite3

connection = sqlite3.connect("app/database/quize.db")

connection.execute("""
ALTER TABLE users
ADD COLUMN role TEXT NOT NULL DEFAULT 'student'
""")

connection.commit()
connection.close()

print("role column added successfully")

