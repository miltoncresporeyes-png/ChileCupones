import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/chilecupones")

def get_database():
    client = MongoClient(MONGO_URI)
    return client.get_database()
