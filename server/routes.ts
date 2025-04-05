const recipeId = Number(req.params.id);
      const userId = req.body.userId;

      if (!userId) {
        return res.status(401).json({ message: "User must be logged in" });
      }

      const user = await db.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Add recipe to user's saved recipes
      const savedRecipes = user.savedRecipes || [];
      if (!savedRecipes.includes(recipeId)) {
        savedRecipes.push(recipeId);
        await db.updateUser(userId, { savedRecipes });
      }

      res.json({ message: "Recipe saved successfully" });
    } catch (error) {
      console.error("Error saving recipe:", error);
      res.status(500).json({ message: "Failed to save recipe" });
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
