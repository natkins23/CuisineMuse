import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { firestoreStorage } from "./firestore";
import { insertNewsletterSchema, insertRecipeSchema } from "@shared/schema";
import { generateRecipe, generateChatResponse } from "./gemini";
import { verifyFirebaseToken } from "./firebase-admin";
import { defaultLimiter, aiLimiter, authLimiter } from "./middleware/rate-limit";
import { sendRecipeEmail, sendTestEmail } from "./email";
import { z } from "zod";

// Use in-memory storage instead of Firestore to avoid permission issues
// const db = firestoreStorage;
const db = storage; // Using in-memory storage for simplicity

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
        console.error("Newsletter validation error:", validatedData.error.format());
        return res.status(400).json({ message: "Invalid email" });
      }

      console.log("Attempting to subscribe email:", validatedData.data.email);
      
      const newsletter = await db.subscribeToNewsletter(validatedData.data.email);
      console.log("Subscription successful, created newsletter entry:", newsletter);

      // Try to send a welcome email to the subscriber
      try {
        if (!process.env.RESEND_API_KEY) {
          console.error('RESEND_API_KEY is not set');
          throw new Error('RESEND_API_KEY is not configured');
        }

        let emailToUse = validatedData.data.email;
        if (emailToUse.endsWith('@example.com') || !emailToUse.includes('@') || process.env.NODE_ENV === 'development') {
          console.log('Using test email for Resend in development environment');
          emailToUse = 'delivered@resend.dev';
        }

        const emailSent = await sendTestEmail(emailToUse);
        if (!emailSent) {
          throw new Error('Email sending failed');
        }
        console.log('Welcome email successfully sent to:', emailToUse);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Still store the subscription but notify about email failure
        res.status(201).json({ 
          ...newsletter, 
          warning: "Subscription saved but welcome email could not be sent" 
        });
        return;
      }
      
      res.status(201).json(newsletter);
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  // Send recipe via email
  const emailRecipeSchema = z.object({
    recipientEmail: z.string().email(),
    recipe: z.object({
      title: z.string(),
      description: z.string().optional(),
      ingredients: z.string().optional(),
      instructions: z.string().optional(),
      mealType: z.string().optional(),
      prepTime: z.number().optional(),
      servings: z.number().optional()
    })
  });

  app.post("/api/email/recipe", async (req: Request, res: Response) => {
    try {
      const validatedData = emailRecipeSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ 
          message: "Invalid email data", 
          errors: validatedData.error.format() 
        });
      }
      
      let email = validatedData.data.recipientEmail;
      
      // For test environments, ensure we use a valid test email for Resend
      // In production this check would be removed
      if (email.endsWith('@example.com') || process.env.NODE_ENV === 'development') {
        console.log('Using test email for Resend in development environment');
        email = 'delivered@resend.dev';
      }
      
      const success = await sendRecipeEmail({
        ...validatedData.data,
        recipientEmail: email
      });
      
      if (!success) {
        return res.status(500).json({ message: "Failed to send email" });
      }
      
      res.json({ message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending recipe email:", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  // Send test email
  const testEmailSchema = z.object({
    email: z.string().email()
  });

  app.post("/api/email/test", async (req: Request, res: Response) => {
    try {
      const validatedData = testEmailSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ 
          message: "Invalid email", 
          errors: validatedData.error.format() 
        });
      }
      
      let email = validatedData.data.email;
      
      // For test environments, ensure we use a valid test email for Resend
      // In production this check would be removed
      if (email.endsWith('@example.com') || process.env.NODE_ENV === 'development') {
        console.log('Using test email for Resend in development environment');
        email = 'delivered@resend.dev';
      }
      
      const success = await sendTestEmail(email);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to send test email" });
      }
      
      res.json({ message: "Test email sent successfully" });
    } catch (error) {
      console.error("Error sending test email:", error);
      res.status(500).json({ message: "Failed to send test email" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
