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
    let systemPrompt = "You are Chef Pierre, a French master chef and culinary expert. ";
    systemPrompt += "Keep your responses short and focused primarily on recipes and ingredients. ";
    systemPrompt += "Minimize commentary and speak directly about the food. ";
    systemPrompt += "You specialize in creating practical recipes based on user preferences and dietary needs. ";
    systemPrompt += "Your first suggestion should always be a complete list of ingredients.";
    
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
      contents: [{ role: "user", parts: [{ text: `${conversationHistory}\n\nProvide a recipe with minimal commentary. Focus on clearly listing ingredients and instructions. Include:
- Title
- Cooking time
- Image URL from Unsplash
- Only a 1-2 sentence description
- Complete list of ingredients with measurements
- Clear step-by-step instructions

Your response should begin with ONLY a brief greeting and recipe introduction (50 words max), followed by the complete recipe in this JSON structure:

{
  "title": "Recipe Title",
  "description": "Brief description of the dish",
  "ingredients": "Complete ingredient list with measurements, each item on a new line",
  "instructions": "Step-by-step instructions, each step on a new line",
  "mealType": "Appetizer/Main/Dessert",
  "prepTime": 30,
  "servings": 4
}

DO NOT include any JSON code blocks syntax like \`\`\`json or \`\`\` in your response. The JSON must be properly formatted and directly parseable.
`}] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500,
      }
    });
    
    const responseText = result.response.text();
    console.log("Full response from Gemini:", responseText);
    
    // Clean up the response to handle code blocks with JSON
    let processedText = responseText;
    
    // Remove any markdown code block indicators (```json, ```, etc.)
    processedText = processedText.replace(/```json|```/g, '');
    
    // Find where the JSON likely begins (first { character that's not inside another structure)
    const jsonStartIndex = processedText.indexOf('{');
    let conversationText = processedText;
    let jsonText = '';
    
    if (jsonStartIndex !== -1) {
      // Split the text into conversation and JSON parts
      conversationText = processedText.substring(0, jsonStartIndex).trim();
      jsonText = processedText.substring(jsonStartIndex);
      
      // Clean up any trailing text after JSON if present
      const lastBraceIndex = jsonText.lastIndexOf('}');
      if (lastBraceIndex !== -1) {
        jsonText = jsonText.substring(0, lastBraceIndex + 1);
      }
      
      // Clean up the conversation text as well (remove any mention of "json" at the end)
      conversationText = conversationText.replace(/\s*json\s*$/i, '');
    }
    
    // Parse the JSON part
    let recipeData = null;
    if (jsonText) {
      try {
        console.log("Attempting to parse JSON:", jsonText);
        recipeData = JSON.parse(jsonText);
        console.log("Successfully parsed recipe data:", recipeData);
      } catch (e) {
        console.error("Failed to parse recipe JSON:", e);
        console.error("JSON that failed to parse:", jsonText);
      }
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
      // Convert string time to minutes if needed
      let prepTimeValue = recipeData.prepTime;
      if (typeof prepTimeValue === 'string') {
        // Try to extract the number from a string like "30 minutes"
        const timeMatch = prepTimeValue.match(/(\d+)/);
        if (timeMatch) {
          prepTimeValue = parseInt(timeMatch[1]);
        } else {
          prepTimeValue = 30; // default
        }
      }
      
      // Convert servings to number if needed
      let servingsValue = recipeData.servings;
      if (typeof servingsValue === 'string') {
        // Try to extract the number from a string like "4 servings"
        const servingsMatch = servingsValue.match(/(\d+)/);
        if (servingsMatch) {
          servingsValue = parseInt(servingsMatch[1]);
        } else {
          servingsValue = 4; // default
        }
      }
      
      // Format cooking time for display
      const cookingTimeDisplay = typeof prepTimeValue === 'number' 
        ? `${prepTimeValue} minutes` 
        : (recipeData.cooking_time || "30 minutes");
      
      // Format servings for display
      const servingsDisplay = typeof servingsValue === 'number'
        ? `${servingsValue} servings`
        : (recipeData.servings || "4 servings");
      
      response.recipe = {
        title: recipeData.title || "Delicious Recipe",
        time: cookingTimeDisplay,
        servings: servingsDisplay,
        recipeData: {
          title: recipeData.title || "Delicious Recipe",
          description: recipeData.description || "A tasty dish",
          ingredients: recipeData.ingredients || "No ingredients specified",
          instructions: recipeData.instructions || "No instructions provided",
          mealType: recipeData.mealType || "Main Dish",
          prepTime: typeof prepTimeValue === 'number' ? prepTimeValue : 30,
          servings: typeof servingsValue === 'number' ? servingsValue : 4
        }
      };
      
      // Create a single suggestion from the recipe data
      response.suggestions = [{
        title: recipeData.title || "Delicious Recipe",
        cooking_time: cookingTimeDisplay,
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
    
    // Construct a direct, focused prompt for recipe generation
    const fullPrompt = `Create a direct, practical recipe for a ${mealType} using ${mainIngredient} ${dietary}.
    
    The user's specific request is: "${options.prompt}"
    
    Provide a complete recipe with:
    - A simple title
    - A brief 1-2 sentence description
    - Complete list of ingredients with precise measurements
    - Clear step-by-step instructions with no extra commentary
    - Estimated preparation time in minutes
    - Number of servings
    
    Format your response as a structured JSON object:
    {
      "title": "Recipe Title",
      "description": "Brief description",
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