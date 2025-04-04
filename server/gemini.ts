import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Initialize the Google Generative AI with API key from environment variable
if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY environment variable is not set");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Create a model for chat conversations - using gemini-2.0-flash which is the latest model
const chatModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
    time: string; // Formatted time (e.g., "25 minutes")
    servings: string; // Formatted servings (e.g., "4 servings")
    recipeData?: Partial<GeneratedRecipe>; // Full recipe data if available
  };
  suggestions?: RecipeSuggestion[]; // Array of recipe suggestions
}

/**
 * Generate a response using Gemini AI's chat capabilities
 */
export async function generateChatResponse(request: ChatRequest): Promise<ChatResponse> {
  try {
    // Create a system prompt to initialize the chat
    let systemPrompt = "You are Chef Pierre, a French master chef and passionate culinary expert. ";
    systemPrompt += "You speak with a charming French accent, using occasional French words and phrases. ";
    systemPrompt += "For example, you might say 'zis' instead of 'this', 'ze' instead of 'the', and often exclaim 'Magnifique!' or 'Très bien!'. ";
    systemPrompt += "You specialize in helping users create delicious recipes based on their preferences and dietary needs. ";
    systemPrompt += "Always be enthusiastic, friendly, and passionate about food. End messages with French phrases when appropriate.";
    
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
      const role = message.role === "user" ? "User" : "Chef Pierre";
      conversationHistory += `${role}: ${message.content}\n`;
    }
    
    // Get the latest user message
    const lastMessage = request.messages[request.messages.length - 1];
    if (lastMessage.role !== "user") {
      throw new Error("Last message must be from the user");
    }
    
    // Add the latest user question
    conversationHistory += `User: ${lastMessage.content}\n\nChef Pierre:`;
    
    // Generate content using Gemini Pro
    const result = await chatModel.generateContent({
      contents: [{ role: "user", parts: [{ text: `${conversationHistory}\n\nPlease provide a single detailed recipe suggestion in your response with:
- A creative title
- Cooking time (in minutes)
- A relevant image URL from Unsplash
- A brief description
- A list of ingredients
- Step-by-step instructions

First, respond to the user's query in your charming Chef Pierre persona. Then include the recipe in valid JSON format as follows:

{
  "recipe": {
    "title": "Recipe Title",
    "cooking_time": "30 minutes",
    "image_url": "https://unsplash.com/photos/relevant-image",
    "description": "Brief description of the dish",
    "ingredients": ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
    "instructions": ["Step 1", "Step 2", "Step 3"],
    "servings": "4 servings"
  }
}

Make sure your response includes both the conversational text AND the JSON recipe data.`}] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500,
      }
    });
    
    const responseText = result.response.text();
    
    // Extract recipe JSON from the response
    const recipeJsonMatch = responseText.match(/\{[\s\S]*"recipe":\s*\{[\s\S]*\}[\s\S]*\}/);
    let recipeData = null;
    
    if (recipeJsonMatch) {
      try {
        // Parse the JSON from the response
        const parsedResponse = JSON.parse(recipeJsonMatch[0]);
        if (parsedResponse.recipe) {
          recipeData = parsedResponse.recipe;
        }
      } catch (e) {
        console.error("Failed to parse recipe JSON:", e);
      }
    }
    
    // Get the conversation text without the JSON
    let conversationText = responseText;
    if (recipeJsonMatch) {
      // Remove the JSON part from the conversation text
      conversationText = responseText.replace(recipeJsonMatch[0], '').trim();
    }
    
    // Create response object
    const response: ChatResponse = {
      message: {
        role: "assistant",
        content: conversationText
      }
    };
    
    // If we have recipe data, add it to the response
    if (recipeData) {
      response.recipe = {
        title: recipeData.title || "Delicious Recipe",
        time: recipeData.cooking_time || "30 minutes",
        servings: recipeData.servings || "4 servings",
        recipeData: {
          title: recipeData.title || "Delicious Recipe",
          description: recipeData.description || "A tasty dish",
          ingredients: recipeData.ingredients ? recipeData.ingredients.join("\n") : "No ingredients specified",
          instructions: recipeData.instructions ? recipeData.instructions.join("\n") : "No instructions provided",
          mealType: recipeData.mealType || "Main Dish",
          prepTime: parseInt(recipeData.cooking_time) || 30,
          servings: parseInt(recipeData.servings) || 4
        }
      };
      
      // Create a single suggestion from the recipe data
      response.suggestions = [{
        title: recipeData.title || "Delicious Recipe",
        cooking_time: recipeData.cooking_time || "30 minutes",
        image_url: recipeData.image_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
        description: recipeData.description || "A tasty dish"
      }];
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
    const fullPrompt = `You are Chef Pierre, a French master chef with expertise in creating delicious recipes.
    Create a detailed recipe for a ${mealType} using ${mainIngredient} ${dietary}.
    
    The user's specific request is: "${options.prompt}"
    
    Please provide a complete recipe with the following structure:
    - A creative French-inspired title for the dish
    - A brief description of the dish (2-3 sentences) with a touch of French flair
    - List of ingredients with measurements
    - Step by step cooking instructions that include some French cooking techniques
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

    // Generate content using the latest Gemini 2.0 model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
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