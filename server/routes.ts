import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { firestoreStorage } from "./firestore";
import { insertNewsletterSchema, insertRecipeSchema } from "@shared/schema";
import { generateRecipe, generateChatResponse } from "./gemini";
import { verifyFirebaseToken } from "./firebase-admin";
import { defaultLimiter, aiLimiter, authLimiter } from "./middleware/rate-limit";

// Use Firestore storage instead of in-memory storage
const db = firestoreStorage;

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply default rate limiting to all API routes
  app.use("/api", defaultLimiter);
  
  // prefix all routes with /api
  
  // Get all recipes
  app.get("/api/recipes", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const recipes = await db.getRecipes(userId);
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });
  
  // Get single recipe
  app.get("/api/recipes/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const recipe = await db.getRecipeById(id);
      
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      res.json(recipe);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      res.status(500).json({ message: "Failed to fetch recipe" });
    }
  });
  
  // Create new recipe - Protected route requiring Firebase auth
  app.post("/api/recipes", async (req: Request, res: Response) => {
    try {
      const validatedData = insertRecipeSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ message: "Invalid recipe data", errors: validatedData.error.format() });
      }
      
      const recipe = await db.createRecipe(validatedData.data);
      res.status(201).json(recipe);
    } catch (error) {
      console.error("Error creating recipe:", error);
      res.status(500).json({ message: "Failed to create recipe" });
    }
  });
  
  // Update recipe
  app.patch("/api/recipes/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const existingRecipe = await db.getRecipeById(id);
      
      if (!existingRecipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      const recipe = await db.updateRecipe(id, req.body);
      res.json(recipe);
    } catch (error) {
      console.error("Error updating recipe:", error);
      res.status(500).json({ message: "Failed to update recipe" });
    }
  });
  
  // Delete recipe
  app.delete("/api/recipes/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const success = await db.deleteRecipe(id);
      
      if (!success) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting recipe:", error);
      res.status(500).json({ message: "Failed to delete recipe" });
    }
  });
  
  // Generate recipe using Google Gemini - with stricter rate limiting
  app.post("/api/generate-recipe", aiLimiter, async (req: Request, res: Response) => {
    try {
      const { prompt, mealType, mainIngredient, dietary } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }
      
      // Use our server-side generateRecipe function
      const recipeData = await generateRecipe({
        prompt,
        mealType,
        mainIngredient,
        dietary
      });
      
      res.json(recipeData);
    } catch (error: any) {
      console.error("Gemini API error:", error);
      res.status(500).json({ 
        message: "Failed to generate recipe", 
        error: error.message || String(error)
      });
    }
  });
  
  // Chat conversation with recipe assistant - with stricter rate limiting
  app.post("/api/chat", aiLimiter, async (req: Request, res: Response) => {
    try {
      const { messages, mealType, mainIngredient, dietary } = req.body;
      
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ message: "Messages array is required" });
      }
      
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || lastMessage.role !== "user" || !lastMessage.content) {
        return res.status(400).json({ message: "Last message must be from user with content" });
      }
      
      const chatResponse = await generateChatResponse({
        messages,
        mealType,
        mainIngredient,
        dietary
      });
      
      // Log the complete response for debugging
      console.log("Chat API Response:", JSON.stringify(chatResponse, null, 2));
      
      res.json(chatResponse);
    } catch (error: any) {
      console.error("Gemini Chat API error:", error);
      res.status(500).json({ 
        message: "Failed to generate chat response", 
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
      
      const newsletter = await db.subscribeToNewsletter(validatedData.data.email);
      res.status(201).json(newsletter);
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
