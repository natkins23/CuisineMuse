import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNewsletterSchema, insertRecipeSchema } from "@shared/schema";
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "placeholder-key");

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  
  // Get all recipes
  app.get("/api/recipes", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const recipes = await storage.getRecipes(userId);
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });
  
  // Get single recipe
  app.get("/api/recipes/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const recipe = await storage.getRecipeById(id);
      
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      res.json(recipe);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipe" });
    }
  });
  
  // Create new recipe
  app.post("/api/recipes", async (req: Request, res: Response) => {
    try {
      const validatedData = insertRecipeSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ message: "Invalid recipe data" });
      }
      
      const recipe = await storage.createRecipe(validatedData.data);
      res.status(201).json(recipe);
    } catch (error) {
      res.status(500).json({ message: "Failed to create recipe" });
    }
  });
  
  // Update recipe
  app.patch("/api/recipes/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const existingRecipe = await storage.getRecipeById(id);
      
      if (!existingRecipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      const recipe = await storage.updateRecipe(id, req.body);
      res.json(recipe);
    } catch (error) {
      res.status(500).json({ message: "Failed to update recipe" });
    }
  });
  
  // Delete recipe
  app.delete("/api/recipes/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteRecipe(id);
      
      if (!success) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete recipe" });
    }
  });
  
  // Generate recipe using Google Gemini
  app.post("/api/generate-recipe", async (req: Request, res: Response) => {
    try {
      const { prompt, mealType = "", mainIngredient = "", dietary = "" } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }
      
      // Construct detailed prompt for Gemini
      const detailedPrompt = `
        Generate a recipe based on the following details:
        User Request: ${prompt}
        ${mealType ? `Meal Type: ${mealType}` : ''}
        ${mainIngredient ? `Main Ingredient: ${mainIngredient}` : ''}
        ${dietary ? `Dietary Restrictions: ${dietary}` : ''}
        
        Format the response as a JSON object with the following fields:
        - title: The name of the recipe
        - description: A brief description of the dish
        - ingredients: A list of ingredients with quantities
        - instructions: Step-by-step cooking instructions
        - mealType: The type of meal (breakfast, lunch, dinner, dessert, snack)
        - prepTime: Estimated preparation time in minutes
        - servings: Number of servings the recipe makes
      `;
      
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
      res.json(recipeData);
    } catch (error: any) {
      console.error("Gemini API error:", error);
      res.status(500).json({ 
        message: "Failed to generate recipe", 
        error: error.message || String(error)
      });
    }
  });
  
  // Subscribe to newsletter
  app.post("/api/newsletter", async (req: Request, res: Response) => {
    try {
      const validatedData = insertNewsletterSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ message: "Invalid email" });
      }
      
      const newsletter = await storage.subscribeToNewsletter(validatedData.data.email);
      res.status(201).json(newsletter);
    } catch (error) {
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
