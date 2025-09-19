import os
from flask import Flask
from dotenv import load_dotenv
from openai import OpenAI
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

app = Flask(__name__)



@app.route('/')
def test():
    variables = {
    "ingredients": "chicken, rice, broccoli",
    "calories": "500",
    "mealtype": "Lunch",
    "diet": "Halal",
    "user": "dislikes: p[istachios, allergies: carrots]"
}

    response = client.responses.create(
        prompt={
            "id": "pmpt_68c7860d64d48196a24b67afa4e28ddd00ec521e6cf656fe",
            "version": "4", 
            "variables": variables
        }
    )


    recipe_json = response.output_text
    print(recipe_json)
    return recipe_json

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000)