import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-secret')
JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=2)
JWT_TOKEN_LOCATION = ['cookies']
JWT_COOKIE_SECURE = False
JWT_COOKIE_HTTPONLY = True
JWT_COOKIE_SAMESITE = 'Lax'
JWT_COOKIE_CSRF_PROTECT = False
FRONTEND_ORIGIN = os.getenv('FRONTEND_ORIGIN', 'http://localhost')

