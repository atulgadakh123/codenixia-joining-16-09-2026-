import sqlite3


def get_connection():
    connection = sqlite3.connect("app/database/quize.db")
    connection.row_factory =sqlite3.Row

    return connection


#crete table
def create_users_table():

    connection =get_connection()

    query = """
     CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        college TEXT NOT NULL,
        division TEXT NOT NULL,
        degree TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL

     )
"""
    connection.execute(query)
    connection.commit()
    connection.close()

    
    #create users
def create_users(name,email,college,division,degree,password,role):
    connection = get_connection()

    query = """
    INSERT INTO users
        (name,email,college,division,degree,password,role)
        VALUES(?, ?, ?, ?, ?, ?, ?)
"""

    cursor = connection.execute(
        query,
        (name,email,college,division,degree,password,role)
    )

    connection.commit()
    user_id =cursor.lastrowid

    connection.close()

    return user_id

#login create

def login_create(email):

    connection = get_connection()

    query = """
        SELECT id, name, email, college, division, degree, password, role
        FROM users
        WHERE email = ?
    """

    user = connection.execute(
        query,
        (email,)
    ).fetchone()

    connection.close()

    return user


