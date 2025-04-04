import { apiRequest } from "./queryClient";

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
 * Generate a recipe using the server-side API that connects to Google Gemini
 */
export async function generateRecipe(options: RecipeGenerationOptions): Promise<GeneratedRecipe> {
  try {
    const response = await apiRequest<GeneratedRecipe>("/api/generate-recipe", {
      method: "POST",
      body: options,
    });
    
    return response;
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw new Error("Failed to generate recipe. Please try again.");
  }
}