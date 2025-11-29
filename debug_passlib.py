from passlib.context import CryptContext

try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    print("Context created")
    hash = pwd_context.hash("admin")
    print(f"Hash created: {hash}")
    print("Success")
except Exception as e:
    print(f"Error: {e}")
