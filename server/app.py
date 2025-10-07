import os
from flask import Flask, request
from dotenv import load_dotenv
from openai import OpenAI
from flask_cors import CORS

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

app = Flask(__name__)
CORS(app)



@app.route('/generateRecipe', methods=['POST'])
def generateRecipe():
    data = request.get_json()
    params = data.get('params', {})

    variables = {
        "ingredients": params.get('ingredients', ''),
        "calories": params.get('calories', '500'),
        "mealtype": params.get('mealtype', 'Dinner'),
        "diet": params.get('diet', 'No-Preference'),
        "user": "dislikes: none, allergies: none"  # Empty user preferences for now
    }

    response = client.responses.create(
        prompt={
            "id": "pmpt_68c7860d64d48196a24b67afa4e28ddd00ec521e6cf656fe",
            "version": "6", 
            "variables": variables
        }
    )


    recipe_json = response.output_text
    print(recipe_json)
    return recipe_json

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000)