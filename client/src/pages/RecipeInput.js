import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Card, Badge } from "react-bootstrap";

function RecipeInput() {
    const [ingredient, setIngredient] = useState("");
    const [ingredientsList, setIngredientsList] = useState([]);
    const [meal, setMeal] = useState("");
    const [diet, setDiet] = useState("");

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

                    <Button variant="success" className="w-100 mt-3">
                        Generate Recipe
                    </Button>
                </Card.Body>

                <style>{`
          .ingredient-badge {
            position: relative;
            display: inline-flex;
            align-items: center;
            padding: 0.45rem 2.2rem 0.45rem 0.8rem; /* extra right padding for X */
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
