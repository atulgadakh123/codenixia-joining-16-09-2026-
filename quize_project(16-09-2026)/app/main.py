from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth_route import router as auth_routes
from app.quiz_route import router as quize_routes

from app.database import create_users_table
from app.quiz_database import create_quize_table


app = FastAPI(title="Quize Application")


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Connect authentication
app.include_router(auth_routes)

app.include_router(quize_routes)


# Create tables
create_users_table()
create_quize_table()


@app.get("/")
def home():
    return {
        "message": "Quize Application"
    }