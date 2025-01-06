
let messageShown = false;  // Track if message has been displayed

// Allow dropping items into the pan
function allowDrop(event) {
    event.preventDefault();
}

// Drag start function
function dragStart(event) {
    event.dataTransfer.setData("text", event.target.dataset.name);
}

// Drop function
function drop(event) {
    event.preventDefault();
    const ingredientName = event.dataTransfer.getData("text");
    const panContents = document.getElementById("pan-contents");

    // Create ingredient element with a cross button
    const ingredientElement = document.createElement("div");
    ingredientElement.className = "ingredient-in-pan";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = ingredientName;
    ingredientElement.appendChild(nameSpan);

    const removeButton = document.createElement("button");
    removeButton.className = "remove-button";
    removeButton.textContent = "✖";
    removeButton.addEventListener("click", () => {
        panContents.removeChild(ingredientElement);
    });
    ingredientElement.appendChild(removeButton);

    panContents.appendChild(ingredientElement);

    // Show the message only if it's the first ingredient
    if (!messageShown) {
        showMessage();
        messageShown = true;
    }
}

// Show the "Cook" button message
function showMessage() {
    const messageDiv = document.getElementById("message");
    messageDiv.textContent = "Press the 'Cook' button to get your recipe!";
}

// Ingredient lists
const vegIngredients = [
    "Spinach 🥬", "Broccoli 🥦", "Tomato 🍅", "Carrot 🥕", "Cucumber 🥒", 
    "Bell Pepper 🌶️", "Cauliflower 🥦", "Peas 🟢", "Onion 🧅", "Zucchini 🥒", 
    "Mushrooms 🍄", "Lettuce 🥬", "Eggplant 🍆", "Beans 🫘", "Cabbage 🥬"
];

const nonVegIngredients = [
    "Chicken 🍗", "Beef 🥩", "Pork 🐖", "Fish 🐟", "Turkey 🦃", "Shrimp 🍤", 
    "Lamb 🐑", "Duck 🦆", "Crab 🦀", "Salmon 🐠", "Tuna 🐟", "Bacon 🥓", 
    "Ham 🍖", "Sausage 🌭", "Meatballs 🍡"
];

const bothIngredients = [
    "Eggs 🥚", "Milk 🥛", "Cheese 🧀", "Yogurt 🍦", "Butter 🧈", "Tofu 🍱", 
    "Rice 🍚", "Noodles 🍜", "Flour 🌾", "Olive Oil 🫒", "Salt 🧂", 
    "Pepper 🌶️", "Garlic 🧄", "Ginger 🫚", "Lemon 🍋"
];

// Fetch recipe from Spoonacular API
document.addEventListener("DOMContentLoaded", () => {
    const doneButton = document.getElementById("done-button");
    const apiKey = 'a2d3d63262cb40cca3981219c67e1a17';  // Replace with your API Key
    const categorySelect = document.getElementById("category");
    const recipeDiv = document.getElementById("recipe");

    // Initially load veg ingredients
    loadIngredients("veg");

    // Listen for category change to filter ingredients
    categorySelect.addEventListener("change", (event) => {
        loadIngredients(event.target.value);
    });

    doneButton.addEventListener("click", () => {
        const ingredients = Array.from(
            document.querySelectorAll("#pan-contents .ingredient-in-pan span")
        ).map((element) => element.textContent);

        if (ingredients.length === 0) {
            recipeDiv.textContent = "Please add some ingredients to the pan first!";
        } else {
            recipeDiv.textContent = "Cooking... Please wait!";
            getRecipeAI(ingredients);
            document.getElementById("message").textContent = "Your recipe is being prepared...";
        }
    });

    // Fetch recipes based on selected ingredients
    async function getRecipeAI(ingredients) {
        const ingredientList = ingredients.join(",+");
        const apiUrl = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredientList}&number=1&apiKey=${apiKey}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            if (data.length > 0) {
                const recipeId = data[0].id;
                getFullRecipe(recipeId);
            } else {
                recipeDiv.textContent = "No recipe could be generated. Try adding more ingredients.";
            }
        } catch (error) {
            console.error("Error fetching recipe:", error);
            recipeDiv.textContent = "Error fetching recipe. Please try again.";
        }
    }

    // Fetch the full recipe details using the recipe ID
    async function getFullRecipe(recipeId) {
        const apiUrl = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            if (data) {
                const recipeTitle = data.title;
                const recipeImage = data.image;
                const recipeInstructions = data.instructions;
                const ingredients = data.extendedIngredients
                    .map(ingredient => ingredient.original)
                    .join(', ');

                recipeDiv.innerHTML = `
                    <h3>${recipeTitle}</h3>
                    <img src="${recipeImage}" alt="${recipeTitle}" style="max-width: 100%; border-radius: 10px;">
                    <h4>Ingredients:</h4>
                    <p>${ingredients}</p>
                    <h4>Instructions:</h4>
                    <p>${recipeInstructions}</p>
                `;
            } else {
                recipeDiv.textContent = "Error retrieving full recipe details.";
            }
        } catch (error) {
            console.error("Error fetching full recipe:", error);
            recipeDiv.textContent = "Error fetching full recipe. Please try again.";
        }
    }

    // Load ingredients based on category
    function loadIngredients(category) {
        let ingredients = [];
        if (category === "veg") {
            ingredients = vegIngredients;
        } else if (category === "nonveg") {
            ingredients = nonVegIngredients;
        } else if (category === "both") {
            ingredients = [...vegIngredients, ...nonVegIngredients, ...bothIngredients];
        }

        const ingredientListContainer = document.getElementById("ingredient-list");
        ingredientListContainer.innerHTML = "";

        ingredients.forEach(ingredient => {
            const ingredientDiv = document.createElement("div");
            ingredientDiv.classList.add("ingredient");
            ingredientDiv.dataset.name = ingredient;
            ingredientDiv.textContent = ingredient;
            ingredientDiv.draggable = true;
            ingredientDiv.addEventListener("dragstart", dragStart);
            ingredientListContainer.appendChild(ingredientDiv);
        });
    }
});

