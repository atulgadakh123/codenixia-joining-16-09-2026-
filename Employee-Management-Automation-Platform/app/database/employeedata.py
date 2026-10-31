from database.userdata import get_connection

def create_employee():
    conn =get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS employee(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone INTEGER NOT NULL,
            department TEXT NOT NULL,
            designation TEXT NOT NULL,
            joining_date TEXT NOT NULL,
            salary INTEGER NOT NULL
        )
    """)
    conn.commit()
    conn.close()

    #INSERT EMPLOYEE
def insert_employeedata(name,email,phone,department,designation,joining_date,salary):
        conn=get_connection()
        conn.execute("""
            INSERT INTO employee(name,email,phone,department,designation,joining_date,salary)
            VALUES(?,?,?,?,?,?,?)
    """,(name,email,phone,department,designation,joining_date,salary))

        conn.commit()
        conn.close()

    #GET ALL EMP
def list_employee():
      conn =get_connection()
      cursor= conn.execute("SELECT * FROM employee")
      user= cursor.fetchall()
      #conn.commit()
      conn.close()
      return list(user)

#GET EMPLOYEE by id
def get_employee_by_id(id):
      conn = get_connection()
      cursor = conn.execute("""
            SELECT * FROM employee
            WHERE id = ?
    """,(id,)) 
      employee=  cursor.fetchone()
      conn.close()

      return employee

#update
def update_employee(id,name,email,phone,department,designation,joining_date,salary):
      conn = get_connection()
      cursor = conn.execute("""
            UPDATE employee
            SET name = ?,
                email = ?,
                phone = ?,
                department = ?,
                designation = ?,
                joining_date =?,
                salary = ?
            WHERE id = ?
        """,(name,email,phone,department,designation,joining_date,salary,id))

      #cursor.fetchone()
      conn.commit()
      conn.close()

#delete
def delete_employee(id):
      conn =get_connection()
      conn.execute("""
            DELETE FROM employee
            WHERE id = ?
        """,(id,))
      conn.commit()
      conn.close()




