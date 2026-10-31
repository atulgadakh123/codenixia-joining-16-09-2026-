
from datetime import datetime
import json
import os

ESCALATION_FILE = "unresolved_cases.json"


def escalate_case(employee_id: int, question: str, reason: str):
    """Save an unresolved employee support case."""

    case = {
        "employee_id": employee_id,
        "question": question,
        "reason": reason,
        "status": "pending",
        "created_at": datetime.now().isoformat(timespec="seconds")
    }

    cases = []

    if os.path.exists(ESCALATION_FILE):
        try:
            with open(ESCALATION_FILE, "r", encoding="utf-8") as file:
                cases = json.load(file)
        except json.JSONDecodeError:
            cases = []

    cases.append(case)

    with open(ESCALATION_FILE, "w", encoding="utf-8") as file:
        json.dump(cases, file, indent=4)

    return {
        "message": "Case escalated for support team review.",
        "case": case
    }
