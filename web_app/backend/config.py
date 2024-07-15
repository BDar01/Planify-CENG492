#configure our application
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from datetime import timedelta
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity

# allows us to send request to the backend from different urls
# to make frontend communicate with backend

app = Flask(__name__)
CORS(app) #disables the error
jwt = JWTManager(app)
app.config['JWT_SECRET_KEY'] = 'bravi'  # Change this to a secure secret key
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
app.secret_key = "bravi"

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///mydatabase.db"
# specifying the location of the database on our machine
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = True

db = SQLAlchemy(app)
# create instance of db to give access to database specified above
# ORM; using py code to modify sql db
