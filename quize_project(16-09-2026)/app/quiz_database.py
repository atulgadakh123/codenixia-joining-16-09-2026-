from app.database import get_connection


def create_quize_table():

    connection = get_connection()

    query = """
    CREATE TABLE IF NOT EXISTS question(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        marks INTEGER DEFAULT 1
    )
    """

    connection.execute(query)
    connection.commit()
    connection.close()


def add_question(
    question,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_answer,
    marks
):

    connection = get_connection()

    query = """
    INSERT INTO question
    (
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        marks
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """

    connection.execute(
        query,
        (
            question,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_answer,
            marks
        )
    )

    connection.commit()
    connection.close()



#get question
def get_question():
    connection =get_connection()

    query = """
        SELECT
          id,
          question,
          option_a,
          option_b,
          option_c,
          option_d,
          marks
    FROM question
    """
    question =connection.execute(query).fetchall()

    #connection.close()
    return question


#check anser
def check_answer(question_id, answer):

    connection = get_connection()

    query = """ SELECT correct_answer, marks
                FROM question
                WHERE id =?
    """

    result = connection.execute(query , (question_id,)).fetchone()

    connection.close()

    return result

#delete question
def delete_question(quesstion_id):
    connection = get_connection()

    query = """
        DELETE FROM question
        WHERE id =?
"""

    connection.execute(query,(quesstion_id,))
    connection.commit()
    connection.close()

            
