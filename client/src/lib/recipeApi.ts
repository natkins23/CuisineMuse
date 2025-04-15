import { apiRequest } from "./queryClient";

export interface RecipeGenerationOptions {
  prompt: string;
  mealType?: string;
  mainIngredient?: string;
  dietary?: string;
}

export interface GeneratedRecipe {
  id?: number;
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  mealType: string;
  prepTime: number;
  servings: number;
  userId?: number | null;
  isSaved?: boolean;
  createdAt?: Date | string;
}

/**
 * Generate a recipe using the server-side API that connects to Google Gemini
 */
export async function generateRecipe(options: RecipeGenerationOptions): Promise<GeneratedRecipe> {
  try {
    const response = await apiRequest<GeneratedRecipe>("/api/generate-recipe", {
      method: "POST",
      body: options as any,
    });
    
    return response;
  } catch (error: any) {
    console.error("Error generating recipe:", error);
    
    // Check if this is a rate limit error
    if (error.status === 429 || 
        (error.response && error.response.status === 429) ||
        (typeof error.message === 'string' && error.message.toLowerCase().includes('rate limit'))) {
      // Specifically throw a rate limit error that can be caught and handled
      const rateLimitError = new Error("You've reached the rate limit for AI requests. Please try again in a few minutes.");
      rateLimitError.name = "RateLimitError";
      throw rateLimitError;
    }
    
    throw new Error("Failed to generate recipe. Please try again.");
  }
}

// Interface for chat messages
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  recipe?: {
    title: string;
    time: string; // Formatted time (e.g., "25 minutes")
    servings: string; // Formatted servings (e.g., "4 servings")
    recipeData?: Partial<GeneratedRecipe>; // Full recipe data if available
  };
}

export interface ChatRequest {
  messages: ChatMessage[];
  mealType?: string;
  mainIngredient?: string;
  dietary?: string;
}

export interface RecipeSuggestion {
  title: string;
  cooking_time: string;
  image_url: string;
  description: string;
}

export interface ChatResponse {
  message: ChatMessage;
  recipe?: {
    title: string;
    time: string;
    servings: string;
    recipeData?: Partial<GeneratedRecipe>; // Full recipe data if available
  };
  suggestions?: RecipeSuggestion[];
}

/**
 * Send a chat message to the AI recipe assistant
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  try {
    const response = await apiRequest<ChatResponse>("/api/chat", {
      method: "POST",
      body: request as any,
    });
    
    return response;
  } catch (error: any) {
    console.error("Error sending chat message:", error);
    
    // Check if this is a rate limit error
    if (error.status === 429 || 
        (error.response && error.response.status === 429) ||
        (typeof error.message === 'string' && error.message.toLowerCase().includes('rate limit'))) {
      // Specifically throw a rate limit error that can be caught and handled
      const rateLimitError = new Error("You've reached the rate limit for AI requests. Please try again in a few minutes.");
      rateLimitError.name = "RateLimitError";
      throw rateLimitError;
    }
    
    throw new Error("Failed to get response from assistant. Please try again.");
  }
}

/**
 * Interface for email recipe request
 */
export interface EmailRecipeRequest {
  recipientEmail: string;
  recipe: Partial<GeneratedRecipe>;
}

/**
 * Send a recipe via email
 */
export async function sendRecipeByEmail(request: EmailRecipeRequest): Promise<{ message: string }> {
  try {
    const response = await apiRequest<{ message: string }>("/api/email/recipe", {
      method: "POST",
      body: request as any,
    });
    
    return response;
  } catch (error: any) {
    console.error("Error sending recipe email:", error);
    throw new Error("Failed to send recipe email. Please try again.");
  }
}

/**
 * Send a test email to verify email functionality
 */
export async function sendTestEmail(email: string): Promise<{ message: string }> {
  try {
    const response = await apiRequest<{ message: string }>("/api/email/test", {
      method: "POST",
      body: { email } as any,
    });
    
    return response;
  } catch (error: any) {
    console.error("Error sending test email:", error);
    throw new Error("Failed to send test email. Please try again.");
  }
}

/**
 * Get saved recipes for a user
 */
export async function getSavedRecipes(userId: number): Promise<GeneratedRecipe[]> {
  try {
    const response = await apiRequest<GeneratedRecipe[]>(`/api/users/${userId}/saved-recipes`, {
      method: "GET"
    });
    
    return response;
  } catch (error: any) {
    console.error("Error fetching saved recipes:", error);
    throw new Error("Failed to fetch saved recipes. Please try again.");
  }
}

/**
 * Save a recipe for a user
 */
export async function saveRecipe(recipeId: number, userId: number): Promise<{ message: string }> {
  try {
    console.log(`Attempting to save recipe ID ${recipeId} for user ID ${userId}`);
    
    // Create direct POST request without using apiRequest
    const url = `/api/recipes/${recipeId}/save`;
    const requestBody = JSON.stringify({ userId });
    
    console.log("Request URL:", url);
    console.log("Request body:", requestBody);
    
    const res = await fetch(url, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: requestBody,
      credentials: "include"
    });
    
    if (!res.ok) {
      throw new Error(`Server responded with ${res.status}: ${res.statusText}`);
    }
    
    const response = await res.json();
    console.log("Save recipe response:", response);
    return response;
  } catch (error: any) {
    console.error("Error saving recipe:", error);
    throw new Error(`Failed to save recipe: ${error.message}`);
  }
}

/**
 * Remove a recipe from saved recipes
 */
export async function unsaveRecipe(recipeId: number, userId: number): Promise<{ message: string }> {
  try {
    console.log(`Attempting to unsave recipe ID ${recipeId} for user ID ${userId}`);
    
    // Create direct DELETE request without using apiRequest
    const url = `/api/recipes/${recipeId}/save`;
    const requestBody = JSON.stringify({ userId });
    
    console.log("Request URL:", url);
    console.log("Request body:", requestBody);
    
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json'
      },
      body: requestBody,
      credentials: "include"
    });
    
    if (!res.ok) {
      throw new Error(`Server responded with ${res.status}: ${res.statusText}`);
    }
    
    const response = await res.json();
    console.log("Unsave recipe response:", response);
    return response;
  } catch (error: any) {
    console.error("Error removing saved recipe:", error);
    throw new Error(`Failed to remove recipe from saved recipes: ${error.message}`);
  }
}