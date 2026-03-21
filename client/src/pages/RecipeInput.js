import React, { useContext, useEffect, useState } from "react";
import axios from 'axios';
import * as Yup from 'yup';
import { Container, Form, Button, Card, Badge } from "react-bootstrap";
import CreatableSelect from 'react-select/creatable';
import AuthContext from "../contexts/AuthContext";

const PRESET_DIETARY_RESTRICTIONS = [
    'Vegetarian',
    'Vegan',
    'Halal',
    'Kosher',
    'Gluten-Free',
    'Dairy-Free',
    'Nut-Free',
    'Pescatarian'
];

const formatEntry = (value) => (
    String(value || '')
        .trim()
        .split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
);

const addUnique = (list, value) => {
    const formatted = formatEntry(value);
    if (!formatted) return list;
    const exists = (list || []).some(item => item.toLowerCase() === formatted.toLowerCase());
    if (exists) return list;
    return [...(list || []), formatted];
};


const RecipeDisplay = ({ recipe }) => {
    if (!recipe || typeof recipe !== 'object' || recipe.validResponse !== true) return null;

    const ingredientsArray = Array.isArray(recipe.ingredients)
        ? recipe.ingredients
        : String(recipe.ingredients || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);

    const instructionsArray = Array.isArray(recipe.instructions)
        ? recipe.instructions
        : String(recipe.instructions || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);

    const copyToClipboard = () => {
        const formattedRecipe = `
${recipe.title || ''}

Ingredients:
${ingredientsArray.join('\n')}

Instructions:
${instructionsArray.join('\n')}

Meal Type: ${recipe.mealType || ''}
Diet: ${recipe.diet || ''}
Calories: ${recipe.calories || ''}
        `.trim();

        navigator.clipboard.writeText(formattedRecipe);
    };

    return (
        <div className="recipe-card p-4 rounded">
            <div className="d-flex justify-content-between align-items-start mb-3">
                <h4 className="text-success mb-0 mr-2">{recipe.title}</h4>
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
                    <Badge bg="secondary">{recipe.mealType || ''}</Badge>
                    <Badge bg="secondary">{recipe.diet || ''}</Badge>
                    <Badge bg="secondary">{recipe.calories || ''} calories</Badge>
                </div>

                <h5 className="mt-3 text-center">Ingredients</h5>
                <ul>
                    {ingredientsArray.map((ing, index) => (
                        <li className="text-start" key={index}>{ing}</li>
                    ))}
                </ul>

                <h5 className="mt-4 text-center">Instructions</h5>
                <ol>
                    {instructionsArray.map((step, index) => (
                        <li className="text-start" key={index}>{step}</li>
                    ))}
                </ol>
            </div>
        </div>
    );
};

function RecipeInput() {
    const { user } = useContext(AuthContext);
    const [ingredient, setIngredient] = useState("");
    const [ingredientsList, setIngredientsList] = useState([]);
    const [meal, setMeal] = useState("Any-Type");
    const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
    const [calories, setCalories] = useState(500);
    const [isLoading, setIsLoading] = useState(false);
    const [recipe, setRecipe] = useState(null);
    const [validationError, setValidationError] = useState("");

    useEffect(() => {
        const restrictions = Array.isArray(user?.dietary_restrictions)
            ? user.dietary_restrictions
            : [];
        setDietaryRestrictions(Array.from(new Set(restrictions)));
    }, [user]);

    const validationSchema = Yup.object().shape({
        ingredients: Yup.array().min(1, 'Please add at least one ingredient.'),
    });

    const api = axios.create({
        baseURL: '/api/',
        withCredentials: true
    });

    const generateRecipe = async () => {
        try {
            try {
                await validationSchema.validate({ ingredients: ingredientsList });
                setValidationError("");
            } catch (validationErr) {
                setValidationError(validationErr.message);
                return;
            }

            setIsLoading(true);
            const response = await api.post(
                "/generateRecipe",
                {
                    ingredients: ingredientsList.join(', '),
                    calories: parseInt(calories),
                    mealtype: meal,
                    diet: dietaryRestrictions.length > 0 ? dietaryRestrictions.join(', ') : 'No-Preference'
                },
            );
            setRecipe(response.data);
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
            if (validationError) setValidationError("");
        }
    };

    const removeIngredient = (index) => {
        setIngredientsList((prev) => {
            const next = prev.filter((_, i) => i !== index);
            if (next.length > 0 && validationError) setValidationError("");
            return next;
        });
    };

    const onInputKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addIngredient();
        }
    };

    const dietaryRestrictionOptions = PRESET_DIETARY_RESTRICTIONS.map(item => ({ value: item, label: item }));

    return (
        <Container className="d-flex justify-content-center align-items-center py-5">
            <Card className="shadow-lg p-4 w-100" style={{ maxWidth: "500px" }}>
                <Card.Body>
                    <h2 className="text-center mb-3 text-success fw-light">Recipe Generator</h2>
                    <h6 className="text-center text-secondary mb-3 fw-light">Custom recipes with your ingredients</h6>

                    <Form.Group className="mb-3">
                        <Form.Label >Ingredients</Form.Label>
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
                        {validationError && (
                            <Form.Text className="text-danger">{validationError}</Form.Text>
                        )}
                        <div className="mt-3 d-flex flex-wrap gap-2">
                            {ingredientsList.map((item, index) => (
                                <Badge
                                    bg="success"
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
                            <option value="Any-Type">Select...</option>
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
                        <CreatableSelect
                            isMulti
                            classNamePrefix="diet-select"
                            options={dietaryRestrictionOptions}
                            placeholder="Type or select dietary restrictions..."
                            value={(dietaryRestrictions || []).map(item => ({ value: item, label: item }))}
                            onChange={(selected) => {
                                const next = (selected || []).map(item => item.value);
                                setDietaryRestrictions(Array.from(new Set(next)));
                            }}
                            formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                        />
                        {dietaryRestrictions.length === 0 && (
                            <Form.Text className="text-muted">No restrictions selected. Using No-Preference.</Form.Text>
                        )}
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
                            <h3 className="text-success fw-light mb-3">Your Recipe</h3>
                            {typeof recipe === 'object' && recipe.validResponse === true ? (
                                <RecipeDisplay recipe={recipe} />
                            ) : typeof recipe === 'object' ? (
                                <Card className="p-3 theme-surface border-danger">
                                    <h5 className="text-danger">Unable to generate recipe</h5>
                                    <p className="mb-0">{recipe.errorMessage || 'The server returned an invalid response.'}</p>
                                </Card>
                            ) : (
                                <Card className="p-3 theme-surface">
                                    <pre className="mb-0">{String(recipe)}</pre>
                                </Card>
                            )}
                        </div>
                    )}
                </Card.Body>

                <style>{`
                    .recipe-card,
                    .theme-surface {
                        background-color: #f8f9fa;
                        color: #212529;
                        border: 1px solid rgba(0, 0, 0, 0.08);
                    }

                    [data-bs-theme='dark'] .recipe-card,
                    [data-bs-theme='dark'] .theme-surface {
                        background-color: #1f242a;
                        color: #f1f3f5;
                        border: 1px solid rgba(255, 255, 255, 0.08);
                    }

                    [data-bs-theme='dark'] .recipe-card h4,
                    [data-bs-theme='dark'] .recipe-card h5,
                    [data-bs-theme='dark'] .recipe-card ol,
                    [data-bs-theme='dark'] .recipe-card ul,
                    [data-bs-theme='dark'] .recipe-card li,
                    [data-bs-theme='dark'] .theme-surface h5,
                    [data-bs-theme='dark'] .theme-surface p,
                    [data-bs-theme='dark'] .theme-surface pre {
                        color: #f1f3f5;
                    }

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
                        font-weight: 700;
                    }

                    .diet-select__control {
                        background-color: #ffffff !important;
                        border-color: #ced4da !important;
                        color: #212529 !important;
                        min-height: 38px !important;
                    }

                    .diet-select__input-container,
                    .diet-select__input,
                    .diet-select__single-value,
                    .diet-select__placeholder {
                        color: #212529 !important;
                    }

                    .diet-select__menu,
                    .diet-select__option {
                        background-color: #ffffff !important;
                        color: #212529 !important;
                    }

                    .diet-select__option--is-focused {
                        background-color: #e9f7ef !important;
                    }

                    .diet-select__multi-value {
                        background-color: #198754 !important;
                        position: relative;
                        display: inline-flex;
                        align-items: center;
                        padding: 0.45rem 2.2rem 0.45rem 0.8rem !important;
                        border-radius: 999px !important;
                        max-width: 200px;
                        line-height: 1.05;
                    }

                    .diet-select__multi-value__label,
                    .diet-select__multi-value__remove {
                        color: #ffffff !important;
                    }

                    .diet-select__multi-value__label {
                        display: inline-block;
                        max-width: 100%;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        text-align: left;
                        font-weight: 700 !important;
                        padding: 0 !important;
                    }

                    .diet-select__multi-value__remove {
                        display: none !important;
                        position: absolute;
                        right: 6px;
                        top: 50%;
                        transform: translateY(-50%);
                        border: none;
                        background: rgba(0,0,0,0.35) !important;
                        width: 22px;
                        height: 22px;
                        border-radius: 999px !important;
                        font-weight: 700;
                        line-height: 18px;
                        cursor: pointer;
                        padding: 0 !important;
                        align-items: center;
                        justify-content: center;
                    }

                    .diet-select__multi-value:hover .diet-select__multi-value__remove {
                        display: inline-flex !important;
                    }

                    [data-bs-theme='dark'] .diet-select__control {
                        background-color: #1f242a !important;
                        border-color: rgba(255, 255, 255, 0.15) !important;
                        color: #f1f3f5 !important;
                    }

                    [data-bs-theme='dark'] .diet-select__input-container,
                    [data-bs-theme='dark'] .diet-select__input,
                    [data-bs-theme='dark'] .diet-select__single-value,
                    [data-bs-theme='dark'] .diet-select__placeholder {
                        color: #f1f3f5 !important;
                    }

                    [data-bs-theme='dark'] .diet-select__menu,
                    [data-bs-theme='dark'] .diet-select__option {
                        background-color: #1f242a !important;
                        color: #f1f3f5 !important;
                    }

                    [data-bs-theme='dark'] .diet-select__option--is-focused {
                        background-color: #2c333a !important;
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

                        .diet-select__multi-value__remove {
                            display: inline-flex !important;
                        }
                    }

                    @media (max-width: 480px) {
                        .ingredient-badge {
                            max-width: 40%;
                            padding-right: 1.6rem;
                        }

                        .diet-select__multi-value {
                            max-width: 40%;
                            padding-right: 1.6rem !important;
                        }

                        .badge-text {
                            font-size: 0.9rem;
                        }

                        .diet-select__multi-value__label {
                            font-size: 0.9rem;
                        }
                    }

                `}</style>
            </Card>
        </Container>
    );
}

export default RecipeInput;
