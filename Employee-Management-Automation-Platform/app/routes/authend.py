from database.userdata import insert_user, login_user,get_user_by_email,get_user,delete_user
from schemas.userSchema import Create_users,Login
from fastapi import APIRouter,HTTPException
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from core.security import create_access_token

user = APIRouter(prefix="/employee", tags=["Employee Management"])

#password hasher
ph =PasswordHasher()
def hash_password(password:str):
    return ph.hash(password)

#verify password
def verify_password(password:str,hash_password:str):
    try:
        ph.verify(hash_password,password)
        return True
    except VerifyMismatchError:
        return False


@user.post("/registration")
def registration(student:Create_users):
    insert_user(
        student.name,
        student.email,
        hash_password(student.password),
        student.role
    )

    return{"message":"User created successfully"}

@user.post("/get_all")
def get_all():
    return get_user()

@user.post("/delete/{id}")
def delete_id(id:int):
    return delete_user(id)

@user.post("/login")
def login(student: Login):
    result = get_user_by_email(student.email)
    if result and verify_password(student.password,result["password"]):
        token = create_access_token({
            "sub":result["email"],
            "role":result["role"]
        })
        return{"message":"Login sucessfull",
               "access_token":token,
               "token_type":"bearer",
               "role": result["role"]
               }
    return{"message":"Invalid email or password"}



    

# @user.get("/get", tags=["Employee Management"])
# def get_all_users():
#     return get_user()

# @user.delete("/delete/{id}")
# def delete_userss(id: int):
#     deleted = delete_user(id)

#     if not deleted:
#         raise HTTPException(
#             status_code=404,
#             detail="User not found"
#         )
    
#     return {
#         "message": "User deleted successfully",
#         "id": id
#     }
