from fastapi import FastAPI
from routes.authend import user
from routes.employeeRoutes import router
from routes.paymentRoute import payment
from routes.attendanceRoute import attendance
from routes.salaryRoute import salary
from ai.ragRoute import rag
from ai.agent_route import agent
from routes.leaveRoute import leave


from database.userdata import create_user 
from database.employeedata import create_employee
from database.paymentdata import create_pament
from database.attendance import create_attendance
from database.salarydata import create_salary
from database.leave_database import create_leave_table

from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://127.0.0.1:5501",
        "http://localhost:5501",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


create_user()
create_employee()
create_pament()
create_attendance()
create_salary()
create_leave_table()

print(user.routes)
app.include_router(user)
app.include_router(router)
app.include_router(payment)
app.include_router(attendance)
app.include_router(salary)
app.include_router(rag)
app.include_router(agent)
app.include_router(leave)

