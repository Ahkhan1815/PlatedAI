import os
from flask import Flask, request, jsonify
from models.user import User
from dotenv import load_dotenv
from openai import OpenAI
from flask_cors import CORS
from pymongo import MongoClient
from flask_jwt_extended import create_access_token, JWTManager, set_access_cookies, jwt_required, get_jwt_identity, unset_jwt_cookies

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

dbClient = MongoClient(os.getenv("MONGODB_URI"))
platedDB = dbClient["platedAI"]
userCollection = platedDB["users"]

app = Flask(__name__)
app.config.from_pyfile('config.py')

frontend = app.config.get('FRONTEND_ORIGIN')
if frontend:
    CORS(app, supports_credentials=True, resources={r"/*": {"origins": frontend}})
else:
    CORS(app, supports_credentials=True)

jwt = JWTManager(app)
app.logger.info(f"CORS configured. FRONTEND_ORIGIN={frontend}")

@app.route('/health', methods=['GET'])
def health_check():
    return {'status': 'healthy'}, 200

@app.route('/generateRecipe', methods=['POST'])
@jwt_required()
def generateRecipe():
    data = request.get_json()

    variables = {
        "ingredients": data.get('ingredients', ''),
        "calories": str(data.get('calories', '500')),
        "mealtype": data.get('mealtype', 'Any-Type'),
        "diet": data.get('diet', 'No-Preference'),
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
    
    access_token = create_access_token(identity=email)
    response = jsonify({"message": "Login Successful"})
    set_access_cookies(response, access_token)

    return response, 200

@app.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    response = jsonify({"message": "Login Successful"});
    unset_jwt_cookies(response)
    return response, 200

@app.route('/id', methods=['GET'])
@jwt_required()
def getID():
    email = get_jwt_identity()
    if not email:
        return jsonify({"user": None}), 200
    user_doc = userCollection.find_one({'email': email})
    user = User.from_mongo(user_doc)
    if not user_doc:
        return jsonify({"user": None}), 200
    return jsonify({"user": User.to_safe_dict(user)}), 200


@app.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    email = get_jwt_identity()
    if not email:
        return jsonify({"user": None}), 200
    user_doc = userCollection.find_one({'email': email})
    if not user_doc:
        return jsonify({"user": None}), 200
    user = User.from_mongo(user_doc)
    return jsonify({"user": User.to_safe_dict(user)}), 200


@app.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    email = get_jwt_identity()
    if not email:
        return jsonify({"error": "Not authenticated"}), 401
    data = request.get_json() or {}
    update_fields = {}

    if 'allergies' in data:
        allergies = data.get('allergies', [])
        if isinstance(allergies, str):
            allergies = [a.strip() for a in allergies.split(',') if a.strip()]
        update_fields['allergies'] = allergies

    if 'health_conditions' in data:
        health_conditions = data.get('health_conditions', [])
        if isinstance(health_conditions, str):
            health_conditions = [c.strip() for c in health_conditions.split(',') if c.strip()]
        update_fields['health_conditions'] = health_conditions

    if 'dietary_restrictions' in data:
        dietary_restrictions = data.get('dietary_restrictions', [])
        if isinstance(dietary_restrictions, str):
            dietary_restrictions = [d.strip() for d in dietary_restrictions.split(',') if d.strip()]
        update_fields['dietary_restrictions'] = dietary_restrictions

    if 'theme_preference' in data:
        theme_preference = str(data.get('theme_preference', 'light')).lower()
        if theme_preference not in ['light', 'dark']:
            return jsonify({"error": "Invalid theme_preference"}), 400
        update_fields['theme_preference'] = theme_preference

    if update_fields:
        userCollection.update_one(
            {'email': email},
            {'$set': update_fields}
        )

    user_doc = userCollection.find_one({'email': email})
    user = User.from_mongo(user_doc)
    return jsonify({"user": User.to_safe_dict(user)}), 200

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    name = data.get('name', '')
    dietary_restrictions = data.get('dietary_restrictions', [])
    theme_preference = str(data.get('theme_preference', 'light')).lower()

    if isinstance(dietary_restrictions, str):
        dietary_restrictions = [d.strip() for d in dietary_restrictions.split(',') if d.strip()]

    if theme_preference not in ['light', 'dark']:
        theme_preference = 'light'

    if userCollection.find_one({'email': email}):
        return {'error': 'Email already in use'}, 409

    user = User.create(
        email=email,
        password=password,
        name=name,
        dietary_restrictions=dietary_restrictions,
        theme_preference=theme_preference
    )
    res = userCollection.insert_one(user.to_mongo())
    user._id = str(res.inserted_id)

    return user.to_safe_dict(), 201


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000)