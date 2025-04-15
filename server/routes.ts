import express, { Express, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { createServer } from "http";
import { IStorage } from "./storage";
import { generateRecipe, generateChatResponse, getSuccessfulGenerations } from "./gemini";
import { insertRecipeSchema, insertNewsletterSchema } from "@shared/schema";
import { sendRecipeEmail, sendTestEmail } from "./email";
import { defaultLimiter, aiLimiter, authLimiter } from "./middleware/rate-limit";
import admin from "./firebase-admin";

export function registerRoutes(app: Express, db: IStorage) {
  // Helper function to ensure a user exists
  async function ensureUserExists(userId: number) {
    console.log(`ensureUserExists called with userId: ${userId}`);
    let user = await db.getUser(userId);
    console.log(`db.getUser returned:`, user);
    
    if (!user) {
      // Create a new user if one doesn't exist
      console.log(`Creating new user with ID: ${userId}`);
      try {
        // The database expects username, password, and optionally email
        user = await db.createUser({
          username: `user${userId}`,
          password: `password${userId}`, // This is just a placeholder since we're using Firebase auth
          email: `user${userId}@example.com`
        });
        console.log(`User created:`, user);
        
        // After creation, update with savedRecipes array
        if (user) {
          console.log(`Updating user ${user.id} with empty savedRecipes array`);
          user = await db.updateUser(user.id, { savedRecipes: [] }) || user;
          console.log(`User updated:`, user);
        }
      } catch (error) {
        console.error(`Error creating or updating user:`, error);
        throw error;
      }
    }
    return user;
  }

  // Get user's saved recipes
  app.get("/api/users/:id/saved-recipes", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.id);
      console.log(`GET /api/users/${userId}/saved-recipes`);
      
      // Ensure user exists
      console.log(`Checking if user ${userId} exists...`);
      const user = await ensureUserExists(userId);
      console.log(`After ensureUserExists, user:`, user);
      
      const savedRecipeIds = user.savedRecipes || [];
      const savedRecipes = [];
      
      for (const recipeId of savedRecipeIds) {
        const recipe = await db.getRecipeById(recipeId);
        if (recipe) {
          savedRecipes.push(recipe);
        }
      }
      
      res.json(savedRecipes);
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
      res.status(500).json({ message: "Failed to fetch saved recipes" });
    }
  });

  // Save recipe

  app.post("/api/recipes/:id/save", async (req: Request, res: Response) => {
    try {
      const recipeId = Number(req.params.id);
      console.log("Raw request body:", req.body, typeof req.body);
      
      // Handle different types of request body formats
      let userId;
      if (typeof req.body === 'string') {
        try {
          const parsedBody = JSON.parse(req.body);
          userId = parsedBody.userId;
          console.log("Parsed userId from string body:", userId);
        } catch (parseError) {
          console.error("Failed to parse request body as JSON:", parseError);
        }
      } else if (req.body && typeof req.body === 'object') {
        userId = req.body.userId;
        console.log("Retrieved userId from object body:", userId);
      }

      console.log(`Server received save recipe request for recipe ${recipeId} and user ${userId}`);

      if (!userId) {
        console.log("Missing userId in request body");
        return res.status(401).json({ message: "User must be logged in" });
      }

      // Ensure user exists
      let user = await ensureUserExists(userId);
      console.log("User found:", user);

      // Add recipe to user's saved recipes
      const savedRecipes = user.savedRecipes || [];
      console.log("Current saved recipes:", savedRecipes);
      
      if (!savedRecipes.includes(recipeId)) {
        savedRecipes.push(recipeId);
        await db.updateUser(userId, { savedRecipes });
        console.log("Updated saved recipes:", savedRecipes);
      } else {
        console.log("Recipe already saved");
      }

      res.json({ message: "Recipe saved successfully" });
    } catch (error) {
      console.error("Error saving recipe:", error);
      res.status(500).json({ message: "Failed to save recipe", error: String(error) });
    }
  });
  
  // Remove recipe from saved recipes
  app.delete("/api/recipes/:id/save", async (req: Request, res: Response) => {
    try {
      const recipeId = Number(req.params.id);
      console.log("Raw request body:", req.body, typeof req.body);
      
      // Handle different types of request body formats
      let userId;
      if (typeof req.body === 'string') {
        try {
          const parsedBody = JSON.parse(req.body);
          userId = parsedBody.userId;
          console.log("Parsed userId from string body:", userId);
        } catch (parseError) {
          console.error("Failed to parse request body as JSON:", parseError);
        }
      } else if (req.body && typeof req.body === 'object') {
        userId = req.body.userId;
        console.log("Retrieved userId from object body:", userId);
      }

      console.log(`Server received unsave recipe request for recipe ${recipeId} and user ${userId}`);

      if (!userId) {
        console.log("Missing userId in request body");
        return res.status(401).json({ message: "User must be logged in" });
      }

      // Ensure user exists
      let user = await ensureUserExists(userId);
      console.log("User found:", user);

      // Remove recipe from user's saved recipes
      const savedRecipes = user.savedRecipes || [];
      console.log("Current saved recipes:", savedRecipes);
      
      const index = savedRecipes.indexOf(recipeId);
      
      if (index !== -1) {
        savedRecipes.splice(index, 1);
        await db.updateUser(userId, { savedRecipes });
        console.log("Updated saved recipes after removal:", savedRecipes);
      } else {
        console.log("Recipe not found in saved recipes");
      }

      res.json({ message: "Recipe removed from saved recipes" });
    } catch (error) {
      console.error("Error removing saved recipe:", error);
      res.status(500).json({ message: "Failed to remove recipe from saved recipes", error: String(error) });
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
  // Get successful generations count
  let successfulGenerations = 0;

  app.get("/api/generations", (req: Request, res: Response) => {
    res.json({ count: successfulGenerations });
  });

  app.post("/api/generations/increment", (req: Request, res: Response) => {
    successfulGenerations++;
    res.json({ count: successfulGenerations });
  });

  app.post(
    "/api/generate-recipe",
    aiLimiter,
    async (req: Request, res: Response) => {
      try {
        const { prompt, mealType, mainIngredient, dietary } = req.body;

        if (!prompt) {
          return res.status(400).json({ message: "Prompt is required" });
        }

        const recipeData = await generateRecipe({
          prompt,
          mealType,
          mainIngredient,
          dietary,
        });

        successfulGenerations++;
        console.log(
          `[✔️ Generation #${successfulGenerations}] Prompt: ${prompt}`,
        );
        res.json(recipeData);
      } catch (error: any) {
        console.error("Gemini API error:", error);
        res.status(500).json({
          message: "Failed to generate recipe",
          error: error.message || String(error),
        });
      }
    },
  );

  // Chat conversation with recipe assistant - with stricter rate limiting
  app.post("/api/chat", aiLimiter, async (req: Request, res: Response) => {
    try {
      console.log("Current generations count:", successfulGenerations);
      const { messages, mealType, mainIngredient, dietary } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ message: "Messages array is required" });
      }

      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || lastMessage.role !== "user" || !lastMessage.content) {
        return res
          .status(400)
          .json({ message: "Last message must be from user with content" });
      }

      const chatResponse = await generateChatResponse({
        messages,
        mealType,
        mainIngredient,
        dietary,
      });

      // Log the complete response for debugging
      console.log("Chat API Response:", JSON.stringify(chatResponse, null, 2));

      res.json(chatResponse);
    } catch (error: any) {
      console.error("Gemini Chat API error:", error);
      res.status(500).json({
        message: "Failed to generate chat response",
        error: error.message || String(error),
      });
    }
  });

  // Debug endpoint to check auth methods
  app.get("/api/debug/auth-methods", async (req: Request, res: Response) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res.status(400).json({ error: "Email parameter required" });
      }

      // Fetch user by email using Admin SDK
      const userRecord = await admin.auth().getUserByEmail(email);

      // Get sign-in methods
      const providerData = userRecord.providerData.map(
        (provider) => provider.providerId,
      );

      res.json({
        email,
        uid: userRecord.uid,
        providers: providerData,
        emailVerified: userRecord.emailVerified,
        disabled: userRecord.disabled,
        metadata: userRecord.metadata,
      });
    } catch (error: any) {
      console.error("Error fetching auth methods:", error);
      res.status(500).json({
        error: error.message,
        code: error.code,
      });
    }
  });

  // Subscribe to newsletter
  app.post("/api/newsletter", async (req: Request, res: Response) => {
    try {
      const validatedData = insertNewsletterSchema.safeParse(req.body);

      if (!validatedData.success) {
        console.error(
          "Newsletter validation error:",
          validatedData.error.format(),
        );
        return res.status(400).json({ message: "Invalid email" });
      }

      console.log("Attempting to subscribe email:", validatedData.data.email);

      const newsletter = await db.subscribeToNewsletter(
        validatedData.data.email,
      );
      console.log(
        "Subscription successful, created newsletter entry:",
        newsletter,
      );

      // Try to send a welcome email to the subscriber
      try {
        if (!process.env.RESEND_API_KEY) {
          console.error("RESEND_API_KEY is not set");
          throw new Error("RESEND_API_KEY is not configured");
        }

        let emailToUse = validatedData.data.email;
        console.log("Original email:", emailToUse);
        console.log("NODE_ENV:", process.env.NODE_ENV);
        console.log("RESEND_API_KEY present:", !!process.env.RESEND_API_KEY);

        if (
          emailToUse.endsWith("@example.com") ||
          !emailToUse.includes("@") ||
          process.env.NODE_ENV === "development"
        ) {
          console.log("Using test email for Resend in development environment");
          emailToUse = "delivered@resend.dev";
        }
        console.log("Final email to use:", emailToUse);

        const emailSent = await sendTestEmail(emailToUse);
        console.log("Email send attempt response:", emailSent);
        if (!emailSent) {
          throw new Error("Email sending failed");
        }
        console.log("Welcome email successfully sent to:", emailToUse);
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Still store the subscription but notify about email failure
        res.status(201).json({
          ...newsletter,
          warning: "Subscription saved but welcome email could not be sent",
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
      servings: z.number().optional(),
    }),
  });

  app.post("/api/email/recipe", async (req: Request, res: Response) => {
    try {
      const validatedData = emailRecipeSchema.safeParse(req.body);

      if (!validatedData.success) {
        return res.status(400).json({
          message: "Invalid email data",
          errors: validatedData.error.format(),
        });
      }

      let email = validatedData.data.recipientEmail;

      // For test environments, ensure we use a valid test email for Resend
      // In production this check would be removed
      if (
        email.endsWith("@example.com") ||
        process.env.NODE_ENV === "development"
      ) {
        console.log("Using test email for Resend in development environment");
        email = "delivered@resend.dev";
      }

      const success = await sendRecipeEmail({
        ...validatedData.data,
        recipientEmail: email,
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
    email: z.string().email(),
  });

  app.post("/api/email/test", async (req: Request, res: Response) => {
    try {
      const validatedData = testEmailSchema.safeParse(req.body);

      if (!validatedData.success) {
        return res.status(400).json({
          message: "Invalid email",
          errors: validatedData.error.format(),
        });
      }

      let email = validatedData.data.email;

      // For test environments, ensure we use a valid test email for Resend
      // In production this check would be removed
      if (
        email.endsWith("@example.com") ||
        process.env.NODE_ENV === "development"
      ) {
        console.log("Using test email for Resend in development environment");
        email = "delivered@resend.dev";
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