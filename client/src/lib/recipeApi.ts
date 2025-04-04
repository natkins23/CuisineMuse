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
      body: options as any,
    });
    
    return response;
  } catch (error) {
    console.error("Error generating recipe:", error);
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
  };
}

export interface ChatRequest {
  messages: ChatMessage[];
  mealType?: string;
  mainIngredient?: string;
  dietary?: string;
}

export interface ChatResponse {
  message: ChatMessage;
  recipe?: {
    title: string;
    time: string;
    servings: string;
  };
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
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw new Error("Failed to get response from assistant. Please try again.");
  }
}