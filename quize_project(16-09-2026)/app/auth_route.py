
from datetime import datetime, timedelta, timezone

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)


from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)

from jose import JWTError, jwt


from passlib.context import CryptContext

from app.database import (
    create_users,
    login_create
)

from app.schema import (
    RegisterRequest,
    Login
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


SECRET_KEY = "codenixia-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto"
)



security = HTTPBearer()
def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(
    plain_password: str,
    hashed_password: str
):
    return pwd_context.verify(
        plain_password,
        hashed_password
    )



def create_access_token(
    email: str,
    role: str
):

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    payload = {
        "sub": email,
        "role": role,
        "exp": expire
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token



def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    )
):

    token = credentials.credentials

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        email = payload.get("sub")
        role = payload.get("role")

        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        if role is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Role not found in token"
            )

        return {
            "email": email,
            "role": role
        }

    except JWTError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )



def require_role(allowed_roles):

    def role_checker(
        current_user=Depends(get_current_user)
    ):

        if current_user["role"] not in allowed_roles:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission"
            )

        return current_user

    return role_checker


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED
)
def register(user: RegisterRequest):

    try:

        
        hashed_password = hash_password(
            user.password
        )

        
        user_id = create_users(
            user.name,
            user.email,
            user.college,
            user.division,
            user.degree,
            hashed_password,
            user.role
        )

        print("USER ID:", user_id)

        return {
            "message": "Registration successful",
            "user_id": user_id,
            "role": user.role
        }

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.post("/login")
def create_login(user: Login):

    
    result = login_create(
        user.email
    )

    if result is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid email and password"
        )


    password_valid = verify_password(
        user.password,
        result["password"]
    )

    if not password_valid:

        raise HTTPException(
            status_code=401,
            detail="Invalid email and password"
        )

    role = result["role"]

    
    access_token = create_access_token(
        result["email"],
        role
    )

    return {

        "message": "Login successful",

        
        "access_token": access_token,

        "token_type": "bearer",

        "role": role
    }

