from fastapi import APIRouter
from pydantic import BaseModel
from ai.rag import ask_question

rag = APIRouter(prefix="/rag", tags=["RAG"])


class QuestionRequest(BaseModel):
    question: str


@rag.post("/ask")
def ask(data: QuestionRequest):
    return ask_question(data.question)