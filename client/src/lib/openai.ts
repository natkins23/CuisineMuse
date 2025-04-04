import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
export const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-placeholder"
});

export interface RecipeGenerationOptions {
  prompt: string;
  mealType?: string;
  mainIngredient?: string;
  dietary?: string;
}

export interface GeneratedRecipe {
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  mealType: string;
  prepTime: number;
  servings: number;
}

export async function generateRecipe(options: RecipeGenerationOptions): Promise<GeneratedRecipe> {
  const { prompt, mealType = "", mainIngredient = "", dietary = "" } = options;
  
  const detailedPrompt = `
    Generate a recipe based on the following details:
    User Request: ${prompt}
    ${mealType ? `Meal Type: ${mealType}` : ''}
    ${mainIngredient ? `Main Ingredient: ${mainIngredient}` : ''}
    ${dietary ? `Dietary Restrictions: ${dietary}` : ''}
    
    Format the response as a JSON object with the following fields:
    - title: The name of the recipe
    - description: A brief description of the dish
    - ingredients: A list of ingredients with quantities (as a string)
    - instructions: Step-by-step cooking instructions (as a string)
    - mealType: The type of meal (breakfast, lunch, dinner, dessert, snack)
    - prepTime: Estimated preparation time in minutes (number)
    - servings: Number of servings the recipe makes (number)
  `;
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert chef who specializes in creating delicious recipes. Provide detailed, accurate recipes with clear instructions." },
        { role: "user", content: detailedPrompt }
      ],
      response_format: { type: "json_object" }
    });
    
    const recipeData = JSON.parse(response.choices[0].message.content);
    return recipeData as GeneratedRecipe;
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw new Error("Failed to generate recipe. Please try again.");
  }
}
