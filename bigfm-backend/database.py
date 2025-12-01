# database.py
from langchain_community.utilities import SQLDatabase
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

load_dotenv()

DB_URL = "mysql+mysqlconnector://root:your_new_password@localhost:3306/bigfm"

# LangChain SQL
def init_database():
    engine_args = {"pool_pre_ping": True, "pool_size": 20, "max_overflow": 40}
    return SQLDatabase.from_uri(DB_URL, engine_args=engine_args)

db = init_database()

# Pure SQLAlchemy Engine
raw_engine = create_engine(DB_URL, pool_pre_ping=True)
