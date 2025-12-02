# database.py
from langchain_community.utilities import SQLDatabase
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

load_dotenv()

# DB_URL = "mysql+mysqlconnector://root:your_new_password@localhost:3306/bigfm"
DB_URL = "mysql+mysqlconnector://bigfmuser:bigfmpassword@db:3306/bigfm"

# DB_URL = f"mysql+mysqlconnector://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:3306/{os.getenv('DB_NAME')}"


# LangChain SQL
def init_database():
    engine_args = {"pool_pre_ping": True, "pool_size": 20, "max_overflow": 40}
    return SQLDatabase.from_uri(DB_URL, engine_args=engine_args)

db = init_database()

# Pure SQLAlchemy Engine
raw_engine = create_engine(DB_URL, pool_pre_ping=True)
