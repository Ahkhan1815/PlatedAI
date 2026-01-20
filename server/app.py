import os
from flask import Flask, request
from models.user import User
from dotenv import load_dotenv
from openai import OpenAI
from flask_cors import CORS
from pymongo import MongoClient

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

dbClient = MongoClient('mongodb://plated-datastore:27017/')
platedDB = dbClient["platedAI"]
userCollection = platedDB["users"]

app = Flask(__name__)
CORS(app)



@app.route('/health', methods=['GET'])
def health_check():
    return {'status': 'healthy'}, 200

@app.route('/generateRecipe', methods=['POST'])
def generateRecipe():
    data = request.get_json()
    params = data.get('params', {})

    variables = {
        "ingredients": params.get('ingredients', ''),
        "calories": str(params.get('calories', '500')),
        "mealtype": params.get('mealtype', 'Any-Type'),
        "diet": params.get('diet', 'No-Preference'),
        "user": "dislikes: none, allergies: none"  # Empty user preferences for now
    }

    response = client.responses.create(
        prompt={
            "id": "pmpt_68c7860d64d48196a24b67afa4e28ddd00ec521e6cf656fe",
            "version": "10", 
            "variables": variables
        }
    )


    recipe_json = response.output_text
    print(recipe_json)
    return recipe_json

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    user_doc = userCollection.find_one({'email': email})
    if not user_doc:
        return {'error': 'Invalid credentials'}, 401

    user = User.from_mongo(user_doc)
    if not user or not user.verify_password(password):
        return {'error': 'Invalid credentials'}, 401

    return user.to_safe_dict(), 200

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    name = data.get('name', '')

    # Check for existing user
    if userCollection.find_one({'email': email}):
        return {'error': 'Email already in use'}, 409

    user = User.create(email=email, password=password, name=name)
    res = userCollection.insert_one(user.to_mongo())
    user._id = str(res.inserted_id)

    return user.to_safe_dict(), 201


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000)