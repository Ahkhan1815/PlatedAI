import React, { useState } from "react";
import axios from 'axios';
import { Container, Form, Button, Card, Badge } from "react-bootstrap";

const hostUrl = process.env.REACT_APP_HOST_URL;

const RecipeDisplay = ({ recipe }) => {
    const copyToClipboard = () => {
        const formattedRecipe = `
${recipe.title}

Ingredients:
${recipe.ingredients.join('\n')}

Instructions:
${recipe.instructions}

Meal Type: ${recipe.mealType}
Diet: ${recipe.diet}
Calories: ${recipe.calories}
        `.trim();

        navigator.clipboard.writeText(formattedRecipe);
    };

    return (
        <div className="recipe-card bg-light p-4 rounded">
            <div className="d-flex justify-content-between align-items-start mb-3">
                <h4 className="text-success mb-0">{recipe.title}</h4>
                <Button 
                    variant="outline-success" 
                    size="sm"
                    onClick={copyToClipboard}
                >
                    Copy Recipe
                </Button>
            </div>

            <div className="recipe-content">
                <div className="d-flex gap-3 mb-3">
                    <Badge bg="secondary">{recipe.mealType}</Badge>
                    <Badge bg="secondary">{recipe.diet}</Badge>
                    <Badge bg="secondary">{recipe.calories} calories</Badge>
                </div>

                <h5 className="mt-3">Ingredients:</h5>
                <ul>
                    {recipe.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                    ))}
                </ul>

                <h5 className="mt-4">Instructions:</h5>
                <p style={{ whiteSpace: 'pre-line' }}>{recipe.instructions}</p>
            </div>
        </div>
    );
};

function RecipeInput() {
    const [ingredient, setIngredient] = useState("");
    const [ingredientsList, setIngredientsList] = useState([]);
    const [meal, setMeal] = useState("");
    const [diet, setDiet] = useState("");
    const [calories, setCalories] = useState(200);
    const [isLoading, setIsLoading] = useState(false);
    const [recipe, setRecipe] = useState(null);

    const generateRecipe = async () => {
        try {
            setIsLoading(true);
            const response = await axios.post(`${hostUrl}/generateRecipe`, {
                params: {
                    ingredients: ingredientsList.join(', '),
                    calories: calories,
                    mealtype: meal,
                    diet: diet
                }
            });
            setRecipe(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error generating recipe:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addIngredient = () => {
        const val = ingredient.trim();
        if (val) {
            setIngredientsList((prev) => [...prev, val]);
            setIngredient("");
        }
    };

    const removeIngredient = (index) => {
        setIngredientsList((prev) => prev.filter((_, i) => i !== index));
    };

    const onInputKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addIngredient();
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center py-5">
            <Card className="shadow-lg p-4 w-100" style={{ maxWidth: "500px" }}>
                <Card.Body>
                    <h2 className="text-center mb-4 text-success fw-bold">🍳 Recipe Builder</h2>

                    <Form.Group className="mb-3">
                        <Form.Label>Ingredients</Form.Label>
                        <div className="d-flex">
                            <Form.Control
                                type="text"
                                placeholder="Enter an ingredient"
                                value={ingredient}
                                onChange={(e) => setIngredient(e.target.value)}
                                onKeyDown={onInputKeyDown}
                            />
                            <Button variant="success" className="ms-2" onClick={addIngredient}>
                                Add
                            </Button>
                        </div>

                        <div className="mt-3 d-flex flex-wrap gap-2">
                            {ingredientsList.map((item, index) => (
                                <Badge
                                    bg="secondary"
                                    key={index}
                                    className="ingredient-badge badge-hover"
                                    title={item}
                                >
                                    <span className="badge-text">{item}</span>
                                    <button
                                        aria-label={`Remove ${item}`}
                                        className="delete-x"
                                        onClick={() => removeIngredient(index)}
                                        type="button"
                                    >
                                        ×
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Meal Type</Form.Label>
                        <Form.Select value={meal} onChange={(e) => setMeal(e.target.value)}>
                            <option value="">Select...</option>
                            <option>Breakfast</option>
                            <option>Lunch</option>
                            <option>Dinner</option>
                            <option>Snack</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Calories</Form.Label>
                        <Form.Control 
                            type="number" 
                            value={calories} 
                            onChange={(e) => setCalories(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Dietary Restrictions</Form.Label>
                        <Form.Select value={diet} onChange={(e) => setDiet(e.target.value)}>
                            <option value="">Select...</option>
                            <option>Vegetarian</option>
                            <option>Vegan</option>
                            <option>Halal</option>
                            <option>Kosher</option>
                            <option>Gluten-Free</option>
                        </Form.Select>
                    </Form.Group>

                    <Button 
                        variant="success" 
                        className="w-100 mt-3" 
                        onClick={generateRecipe}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Generating...' : 'Generate Recipe'}
                    </Button>

                    {isLoading && (
                        <div className="text-center mt-4">
                            <div className="spinner-border text-success" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">Generating your recipe...</p>
                        </div>
                    )}

                    {!isLoading && recipe && (
                        <div className="mt-4">
                            <h3 className="text-success mb-3">Your Recipe</h3>
                            <RecipeDisplay recipe={recipe} />
                        </div>
                    )}
                </Card.Body>

                <style>{`
                    .ingredient-badge {
                        position: relative;
                        display: inline-flex;
                        align-items: center;
                        padding: 0.45rem 2.2rem 0.45rem 0.8rem;
                        border-radius: 999px;
                        max-width: 200px;
                        line-height: 1.05;
                    }

                    .badge-text {
                        display: inline-block;
                        max-width: 100%;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        text-align: left;
                    }

                    .delete-x {
                        display: none;
                        position: absolute;
                        right: 6px;
                        top: 50%;
                        transform: translateY(-50%);
                        border: none;
                        background: rgba(0,0,0,0.35);
                        color: white;
                        width: 22px;
                        height: 22px;
                        border-radius: 50%;
                        font-weight: 700;
                        line-height: 18px;
                        cursor: pointer;
                        padding: 0;
                        align-items: center;
                        justify-content: center;
                    }

                    .badge-hover:hover .delete-x {
                        display: inline-flex;
                    }

                    .recipe-result {
                        max-height: 400px;
                        overflow-y: auto;
                    }

                    .spinner-border {
                        width: 3rem;
                        height: 3rem;
                    }

                    @media (hover: none) {
                        .delete-x {
                            display: inline-flex;
                        }
                    }

                    @media (max-width: 480px) {
                        .ingredient-badge {
                            max-width: 40%;
                            padding-right: 1.6rem;
                        }

                        .badge-text {
                            font-size: 0.9rem;
                        }
                    }
                `}</style>
            </Card>
        </Container>
    );
}

export default RecipeInput;
