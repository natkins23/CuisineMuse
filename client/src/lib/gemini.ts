import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with API key from environment variable
export const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "placeholder-key");

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
    // Use Gemini Pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Configure the generation
    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: detailedPrompt }] }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    });

    // Get the response text
    const responseText = result.response.text();
    
    // Extract the JSON part from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in the response");
    }
    
    const recipeData = JSON.parse(jsonMatch[0]);
    return recipeData as GeneratedRecipe;
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw new Error("Failed to generate recipe. Please try again.");
  }
}