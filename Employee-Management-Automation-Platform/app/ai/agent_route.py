from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ai.agent1 import ask_agent


agent = APIRouter(
    prefix="/employee-agent",
    tags=["Employee AI Agent"]
)


class EmployeeAgentRequest(BaseModel):
    employee_id: int | None = None
    question: str = Field(min_length=1)


@agent.post("/ask")
def ask_employee_agent(request: EmployeeAgentRequest):

    try:
        result = ask_agent(
            employee_id=request.employee_id,
            question=request.question
        )

        if isinstance(result, dict) and "error" in result:
            raise HTTPException(
                status_code=400,
                detail=result["error"]
            )

        return result

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Agent error: {error}"
        )