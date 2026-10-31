from pydantic import BaseModel,Field,EmailStr
from datetime import date

class employee_create(BaseModel):
    name:str
    email:EmailStr
    phone:int=Field(ge=1000000000,le=9999999999)
    designation:str
    department:str
    joining_date:date
    salary:float

class employee_update(BaseModel):
        
        name:str
        email:EmailStr
        phone:int=Field(ge=1000000000,le=9999999999)
        department:str
        designation:str
        joining_date:date
        salary:float =Field(ge=0)