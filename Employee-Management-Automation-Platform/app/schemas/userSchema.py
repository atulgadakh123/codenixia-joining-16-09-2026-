from pydantic import BaseModel, Field, EmailStr
from typing import Literal
class Create_users(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=8, max_length=8)
    role:Literal["admin","employee"]

class Login(BaseModel):
    email:EmailStr
    password: str = Field(min_length=8, max_length=8)