import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

console.log("Loaded GEMINI_API_KEY:", JSON.stringify(process.env.GEMINI_API_KEY));


if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY environment variable is not set");
}

console.log("Initializing Gemini AI with API key (length):", process.env.GEMINI_API_KEY?.length || 0);

const MODEL_NAME = "gemini-2.0-flash";
console.log("Using Gemini model:", MODEL_NAME);

function getChatModel(): GenerativeModel {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured");
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: MODEL_NAME });
}

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
    time: string;
    servings: string;
    recipeData?: Partial<GeneratedRecipe>;
  };
  suggestions?: RecipeSuggestion[];
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

let successfulGenerations = 0;
export function getSuccessfulGenerations() {
  return successfulGenerations;
}

export async function generateChatResponse(request: ChatRequest): Promise<ChatResponse> {
  try {
    const model = getChatModel();

    let systemPrompt = "You are Chef Pierre, a French master chef and culinary expert. ";
    systemPrompt += "Keep your responses short and focused primarily on recipes and ingredients. ";
    systemPrompt += "Minimize commentary and speak directly about the food. ";
    systemPrompt += "You specialize in creating practical recipes based on user preferences and dietary needs. ";
    systemPrompt += "Your first suggestion should always be a complete list of ingredients.";

    if (request.mealType) {
      systemPrompt += ` The user is interested in ${request.mealType.toLowerCase()} recipes.`;
    }
    if (request.mainIngredient) {
      systemPrompt += ` The user wants to cook with ${request.mainIngredient.toLowerCase()}.`;
    }
    if (request.dietary) {
      systemPrompt += ` The user has ${request.dietary.toLowerCase()} dietary preferences.`;
    }

    let conversationHistory = `${systemPrompt}\n\nConversation History:\n`;

    for (let i = 0; i < request.messages.length - 1; i++) {
      const message = request.messages[i];
      const role = message.role === "user" ? "User" : "Chef Pierre";
      conversationHistory += `${role}: ${message.content}\n`;
    }

    const lastMessage = request.messages[request.messages.length - 1];
    if (lastMessage.role !== "user") {
      throw new Error("Last message must be from the user");
    }

    conversationHistory += `User: ${lastMessage.content}\n\nChef Pierre:`;

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: `${conversationHistory}\n\nProvide a recipe in this JSON format (no markdown, no commentary):\n{\n  \"title\": \"...\",\n  \"description\": \"...\",\n  \"ingredients\": \"...\",\n  \"instructions\": \"...\",\n  \"mealType\": \"...\",\n  \"prepTime\": 30,\n  \"servings\": 4\n}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500,
      }
    });

    const responseText = result.response.text().replace(/```json|```/g, '');
    const jsonStartIndex = responseText.indexOf('{');
    const jsonEndIndex = responseText.lastIndexOf('}');
    const jsonText = responseText.slice(jsonStartIndex, jsonEndIndex + 1);
    let conversationText = responseText.slice(0, jsonStartIndex).trim();
    if (!conversationText) {
      conversationText = "Here’s a recipe you might enjoy! 🍽️";
    }
    
    const recipeData = JSON.parse(jsonText);

    const prepTime = typeof recipeData.prepTime === "string" ? parseInt(recipeData.prepTime.match(/\d+/)?.[0] || "30") : recipeData.prepTime;
    const servings = typeof recipeData.servings === "string" ? parseInt(recipeData.servings.match(/\d+/)?.[0] || "4") : recipeData.servings;

    return {
      message: {
        role: "assistant",
        content: conversationText
      },
      recipe: {
        title: recipeData.title,
        time: `${prepTime} minutes`,
        servings: `${servings} servings`,
        recipeData: {
          ...recipeData,
          prepTime,
          servings
        }
      },
      suggestions: [{
        title: recipeData.title,
        cooking_time: `${prepTime} minutes`,
        image_url: recipeData.image_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
        description: recipeData.description
      }]
    };
  } catch (error: any) {
    console.error("Gemini Chat API error:", error);
    throw new Error(`AI service error: ${error.message || "Unknown error"}`);
  }
}

export async function generateRecipe(options: RecipeGenerationOptions): Promise<GeneratedRecipe> {
  try {
    const model = getChatModel();

    const fullPrompt = `Create a practical recipe for a ${options.mealType || "meal"} using ${options.mainIngredient || "any ingredient"} ${options.dietary ? "with " + options.dietary + " dietary restrictions" : ""}.\nUser wants: \"${options.prompt}\"\nFormat result as JSON (no markdown):\n{\n  \"title\": \"...\",\n  \"description\": \"...\",\n  \"ingredients\": \"...\",\n  \"instructions\": \"...\",\n  \"mealType\": \"...\",\n  \"prepTime\": 30,\n  \"servings\": 4\n}`;

    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not extract recipe JSON");

    const recipeData = JSON.parse(jsonMatch[0]);
    const recipe: GeneratedRecipe = {
      title: recipeData.title || "Untitled",
      description: recipeData.description || "",
      ingredients: recipeData.ingredients || "",
      instructions: recipeData.instructions || "",
      mealType: recipeData.mealType || options.mealType || "Main",
      prepTime: parseInt(recipeData.prepTime) || 30,
      servings: parseInt(recipeData.servings) || 4
    };

    successfulGenerations++;
    console.log(`Successfully generated recipe #${successfulGenerations}`);

    return recipe;
  } catch (error: any) {
    console.error("Gemini Recipe API error:", error);
    throw new Error(`AI service error: ${error.message || "Unknown error"}`);
  }
}
