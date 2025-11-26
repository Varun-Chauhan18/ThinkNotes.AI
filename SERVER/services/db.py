# SERVER/services/db.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Example MYSQL_URL: mysql+pymysql://user:password@localhost:3306/thinknotes
DATABASE_URL = os.getenv("MYSQL_URL") or "mysql+pymysql://root:root@localhost:3306/thinknotes"

# Engine and SessionLocal
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Call this on app startup (or import time) to create tables if they don't exist
def init_db():
    import services.models  # ensure ORM models are imported
    Base.metadata.create_all(bind=engine)
