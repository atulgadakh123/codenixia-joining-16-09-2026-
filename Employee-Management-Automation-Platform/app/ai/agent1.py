import ollama
from datetime import datetime, date, time
from ai.tool1 import (
    get_all_employees,
    get_employee_by_id,
    list_all,
    calculate,
    pending,
    summary,
    get_all_attendance,
    get_employee_attendance,
    get_total_attendance,
    # end_time,
    search_employee,
    
)


model = "llama3.2"


def employee_info(employee_id: int):
    """
    Get employee master information from the employee database.

    Use this tool for:
    - employee name
    - email
    - phone
    - department
    - designation
    - joining date
    - base salary stored in the employee table

    Do NOT use this tool for salary calculation or payment information.
    """
    result = get_employee_by_id(employee_id)

    if result is None:
        return {"error": "Employee not found"}

    return dict(result)


def all_employees():
    """
    Get complete information of all employees.

    Return the actual employee records from the database.
    Include for every employee:
    ID, name, email, phone, department, designation,
    joining date and salary.
    """
    result = get_all_employees()

    if result is None:
        return []

    return [dict(row) for row in result]


def salary_info(employee_id: int):
    """
    Get calculated salary information.

    Use this tool for:
    - calculated salary
    - salary based on attendance
    - salary calculation

    Do NOT use this tool for the base salary stored
    in the employee table.
    """
    return calculate(employee_id)


def pending_payment(employee_id: int):
    """Get pending payment information of an employee by employee ID."""
    return pending(employee_id)


def salary_slip(employee_id: int,month: int, year: int):
    """Get payment summary of an employee by employee ID."""
    return summary(employee_id, month, year)


def employee_attendance(employee_id: int):
    """Get attendance records of an employee by employee ID."""
    return get_employee_attendance(employee_id)


def total_attendance(employee_id: int,month=None, year=None, date=None):
    """Get total, present and absent attendance of an employee by employee ID."""
    if month in (None, "", "null", "None", "current month"):
            month = None
    
    if year in (None, "", "null", "None", "current year"):
            year = None
    
    if date in (None, "", "null", "None", "today"):
            date = None
    
    if month is None and year is None and date is None:
            date = datetime.now().strftime("%Y-%m-%d")
        

    return get_total_attendance(employee_id, int(month), int(year))


# def end_time_tool(employee_id: int):
#     """Get attendance percentage of an employee by employee ID."""
#     return end_time(employee_id)


def all_attendance(month=None, year=None, date=None):
    """Get attendance records of all employees."""
    if month in (None, "", "null", "None", "current month"):
        month = None

    if year in (None, "", "null", "None", "current year"):
        year = None

    if date in (None, "", "null", "None", "today"):
        date = None

    if month is None and year is None and date is None:
        date = datetime.now().strftime("%Y-%m-%d")

    return get_all_attendance(month, year, date)


def all_payments():
    """Get payment records of all employees."""
    return list_all()

def searchh_employee(search_text: str):
    """
        search employee using name,email,department or designation
    """
    result = search_employee(search_text)
    if not result:
        return{"error":"No employee found"}

    return[dict(row)for row in result]






tools = [
    employee_info,
    all_employees,
    salary_info,
    pending_payment,
    salary_slip,
    employee_attendance,
    total_attendance,
    # end_time_tool,
    all_attendance,
    all_payments,
    searchh_employee
]


def ask_agent(employee_id: int | None, question: str):

    messages = [
         {
        "role": "system",
        "content": (
           "You are an employee database assistant. "
            "Answer the user's question using ONLY the actual data returned by tools. "
            "Use ONLY tool results from the current request. "
            "Do not use information from previous examples, previous responses, or your own knowledge. "
            "Never invent, assume, create, or add employee data. "
            "Never give sample employee data. "
            "Never mention employees that are not present in the current tool results. "
            "If the tool returns employee records, directly answer using those exact records. "
            "If the user asks for complete employee information, display every employee "
            "and all available fields from the current tool result. "
            "Do not explain what a Python dictionary is unless the user asks. "
            "Use search_employee when the user wants to find employees by name, email, department, or designation. "
            "Use comparison_employee when the user asks to compare two employees. "
            "Use multiple tools when the user's question asks for multiple types of information. "
            "If the user asks for salary and attendance percentage, call both salary_info "
            "and attendance_percentage_tool. "
            "If the user asks for salary, attendance, and payment information, call all "
            "relevant tools: salary_info, attendance_percentage_tool, and pending_payment. "
            "Do not use all_employees for specific salary, attendance, or payment questions. "
            "For attendance questions, use employee_attendance for a specific employee. "
            "Use all_attendance when attendance records of all employees are requested. "
            "If all_attendance is used, find the requested employee_id in the returned records "
            "and answer using that matching record. "
            "Never say attendance is unavailable if the requested employee's attendance exists "
            "in the tool result. "
            "When multiple tools are called, combine ONLY their current tool results into the final answer. "
            "Report numeric values exactly as returned by the tools. "
            "Do not change, estimate, or calculate values unless explicitly requested by the user. "
            "If the requested information is not available in the current tool results, "
            "say that the information is not available. "
            "Salary values are in Indian Rupees (INR). Always use ₹ for salary amounts, never $. "
            "Use the relevant tools to collect the required employee data, salary, attendance, "
            "and payment information. "
            "After receiving the tool results, analyze only the current tool results and provide "
            "a clear summary and useful insights. "
            "Do not invent or assume any information that is not present in the tool results."
           """- If the user does not provide a month and year, consider only today's attendance.
            - Do not assume or use any default month or year.
            - If the user provides a month and year, fetch attendance for that specific month and year.
            - Never fetch monthly attendance when the user asks for today's attendance."""
            "Never invent attendance records, dates, or percentages. "
            "If a tool returns no data or an error message, report that result honestly."
        )
    },
        {
            "role": "user",
            "content": (
                f"Employee ID: {employee_id}\n"
                f"Question: {question}"
            )
        }
    ]

    response = ollama.chat(
        model=model,
        messages=messages,
        tools=tools
    )

    print("TOOL CALLS:", response["message"].get("tool_calls"))

    if response["message"].get("tool_calls"):

        messages.append({
            "role": "assistant",
            "content": response["message"].get("content", ""),
            "tool_calls": response["message"].get("tool_calls", [])
        })

        for tool_call in response["message"]["tool_calls"]:

            function_name = tool_call["function"]["name"]
            arguments = tool_call["function"]["arguments"] 
            for key in ("month", "year", "date"):
              if arguments.get(key) == "":
                arguments[key] = None

                result = globals()[function_name](**arguments)

            arguments = dict(arguments)

            if arguments.get("employee_id") is not None:
                arguments["employee_id"] = int(arguments["employee_id"])
                
            if isinstance(arguments, dict) and "employee_id" in arguments:
                if employee_id is not None:
                    arguments["employee_id"] = employee_id

            result = globals()[function_name](**arguments)

            print("TOOL RESULT:", result)

            messages.append({
                "role": "tool",
                "content": f"Tool result for {function_name}: {result}"
            })

        final_response = ollama.chat(
            model=model,
            messages=messages,
            
        )
        print("FINAL RESPONSE:", final_response)

        return final_response["message"]["content"]

    return response["message"]["content"]