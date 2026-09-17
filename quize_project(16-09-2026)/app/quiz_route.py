from fastapi import APIRouter,Depends

from app.quizeschema import questionCreate,QuizeSubmit
from app.quiz_database import add_question, get_question,check_answer, delete_question

from app.auth_route import get_current_user


router = APIRouter(
    prefix="/quiz",
    tags=["Quiz"]
)


@router.post("/questions")
def create_question(question: questionCreate, current_user : dict=Depends(get_current_user)):

    if current_user["role"] != "admin":
        return {"message":"only admin can create question"}

    add_question(
        question.question,
        question.option_a,
        question.option_b,
        question.option_c,
        question.option_d,
        question.correct_answer,
        question.marks
    )

    return {
        "message": "Question added successfully"
    }

@router.get("/get")
def get_all_question(current_user : dict=Depends(get_current_user)):

    question =get_question()

    return {
        "question" : question
    }



@router.post("/submit")
def checker_anser(quize:QuizeSubmit, current_user : dict=Depends(get_current_user)):
    correct =0
    wrong =0
    total =0

    for item in quize.answers:

        result =check_answer(
            item.question_id,
            item.answer

        )

        if result is not None:

            if item.answer.upper() == result["correct_answer"].upper():
                correct += 1
                total += result["marks"]
                print("Question ID:", item.question_id) 
                print("Marks:", result["marks"])
                print("Total:", total)   

            else:
                wrong += 1
    result = "PASS" if total > 30 else "FAIL"

    return{
       "correct":correct,
       "wrong":wrong,
       "marks":total ,
       "result":result
    }


#delete question
@router.delete("/delete/{question_id}")
def delete_questions(question_id:int, current_user : dict=Depends(get_current_user)):

    if current_user["role"] != "admin":
        return {"message": "Only admin can delete question"}
    
    delete_question(question_id)

    return{
        "message" : "question deleted sucessfully"
    } 