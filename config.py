import os
from dotenv import load_dotenv

# Get the absolute path of the directory this file is in
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# This looks for a .env file in the 'backend' folder
load_dotenv(os.path.join(BASE_DIR, '..', '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a-very-secret-key-that-you-should-change'
    DATABASE_PATH = os.path.join(BASE_DIR, '..', 'instance', 'cakedb.db')
    
    # GOOGLE_API_KEY and COHERE_API_KEY removed