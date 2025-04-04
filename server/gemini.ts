import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with API key from environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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

/**
 * Generate a recipe using Google's Gemini AI
 */
export async function generateRecipe(options: RecipeGenerationOptions): Promise<GeneratedRecipe> {
  try {
    // Default values
    const mealType = options.mealType || "Any meal";
    const mainIngredient = options.mainIngredient || "any ingredients";
    const dietary = options.dietary ? `with ${options.dietary} dietary restrictions` : "with no specific dietary restrictions";
    
    // Construct a detailed prompt for better recipe generation
    const fullPrompt = `Create a detailed recipe for a ${mealType} using ${mainIngredient} ${dietary}.
    
    The user's specific request is: "${options.prompt}"
    
    Please provide a complete recipe with the following structure:
    - A creative title for the dish
    - A brief description of the dish (2-3 sentences)
    - List of ingredients with measurements
    - Step by step cooking instructions
    - Estimated preparation time in minutes
    - Number of servings
    
    Format your response as a structured JSON object with these fields:
    {
      "title": "Recipe Title",
      "description": "Brief description of the dish",
      "ingredients": "Complete ingredients list with measurements",
      "instructions": "Step by step cooking instructions",
      "mealType": "${mealType}",
      "prepTime": preparation time in minutes (number only),
      "servings": number of servings (number only)
    }`;

    // Generate content using Gemini Pro
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse recipe from AI response");
    }
    
    const recipeData = JSON.parse(jsonMatch[0]);
    
    // Ensure we have all required fields
    return {
      title: recipeData.title || "Untitled Recipe",
      description: recipeData.description || "No description provided",
      ingredients: recipeData.ingredients || "No ingredients provided",
      instructions: recipeData.instructions || "No instructions provided",
      mealType: recipeData.mealType || mealType,
      prepTime: parseInt(recipeData.prepTime) || 30,
      servings: parseInt(recipeData.servings) || 4
    };
  } catch (error) {
    console.error("Error generating recipe with Gemini:", error);
    throw new Error("Failed to generate recipe. Please try again.");
  }
}