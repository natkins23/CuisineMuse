import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Initialize the Google Generative AI with API key from environment variable
if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY environment variable is not set");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Create a model for chat conversations - using gemini-1.5-flash model which is available in API v1
const chatModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Interface for chat messages
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
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
    time: string; // Formatted time (e.g., "25 minutes")
    servings: string; // Formatted servings (e.g., "4 servings")
    recipeData?: Partial<GeneratedRecipe>; // Full recipe data if available
  };
}

/**
 * Generate a response using Gemini AI's chat capabilities
 */
export async function generateChatResponse(request: ChatRequest): Promise<ChatResponse> {
  try {
    // Create a system prompt to initialize the chat
    let systemPrompt = "You are CulinaryMuse, a helpful and creative AI cooking assistant. ";
    systemPrompt += "You specialize in helping users create recipes based on their preferences and dietary needs. ";
    systemPrompt += "Always be friendly, concise, and focus on answering cooking questions.";
    
    // Add user preferences if provided
    if (request.mealType) {
      systemPrompt += ` The user is interested in ${request.mealType.toLowerCase()} recipes.`;
    }
    if (request.mainIngredient) {
      systemPrompt += ` The user wants to cook with ${request.mainIngredient.toLowerCase()}.`;
    }
    if (request.dietary) {
      systemPrompt += ` The user has ${request.dietary.toLowerCase()} dietary preferences.`;
    }
    
    // Prepare the conversation history as a string
    let conversationHistory = `${systemPrompt}\n\nConversation History:\n`;
    
    // Add previous messages to the context
    for (let i = 0; i < request.messages.length - 1; i++) {
      const message = request.messages[i];
      const role = message.role === "user" ? "User" : "CulinaryMuse";
      conversationHistory += `${role}: ${message.content}\n`;
    }
    
    // Get the latest user message
    const lastMessage = request.messages[request.messages.length - 1];
    if (lastMessage.role !== "user") {
      throw new Error("Last message must be from the user");
    }
    
    // Add the latest user question
    conversationHistory += `User: ${lastMessage.content}\n\nCulinaryMuse:`;
    
    // Generate content using Gemini Pro
    const result = await chatModel.generateContent({
      contents: [{ role: "user", parts: [{ text: conversationHistory }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      }
    });
    
    const responseText = result.response.text();
    
    // Check if the response contains a recipe (very basic detection)
    const hasRecipe = 
      responseText.includes("ingredients:") || 
      responseText.includes("Instructions:") ||
      responseText.includes("minutes") && responseText.includes("servings");
    
    // Create response object
    const response: ChatResponse = {
      message: {
        role: "assistant",
        content: responseText
      }
    };
    
    // If it seems like a recipe, add a simplified recipe object
    if (hasRecipe) {
      // Extract a title - look for capitalized words at the beginning of the response
      const titleMatch = responseText.match(/^(?:Here's|Here is|Try this|How about)(.*?)[.!?]/i);
      const recipeTitle = titleMatch ? titleMatch[1].trim() : "Delicious Recipe";
      
      // Try to extract cooking time
      const timeMatch = responseText.match(/(\d+)(?:\s+to\s+\d+)?\s+minutes/i);
      const cookingTime = timeMatch ? timeMatch[0] : "30 minutes";
      
      // Try to extract servings
      const servingsMatch = responseText.match(/(\d+)(?:\s+to\s+\d+)?\s+servings/i);
      const servings = servingsMatch ? servingsMatch[0] : "4 servings";
      
      response.recipe = {
        title: recipeTitle,
        time: cookingTime,
        servings: servings
      };
    }
    
    return response;
  } catch (error) {
    console.error("Error generating chat response with Gemini:", error);
    throw new Error("Failed to generate response. Please try again.");
  }
}

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

    // Generate content using Gemini model that's available in API v1
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
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