import { 
  users, type User, type InsertUser,
  recipes, type Recipe, type InsertRecipe,
  newsletters, type Newsletter, type InsertNewsletter
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Recipe methods
  getRecipes(userId?: number): Promise<Recipe[]>;
  getRecipeById(id: number): Promise<Recipe | undefined>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  updateRecipe(id: number, recipe: Partial<InsertRecipe>): Promise<Recipe | undefined>;
  deleteRecipe(id: number): Promise<boolean>;
  
  // Newsletter methods
  subscribeToNewsletter(email: string): Promise<Newsletter>;
  getNewsletterSubscribers(): Promise<Newsletter[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private recipesMap: Map<number, Recipe>;
  private newslettersMap: Map<number, Newsletter>;
  private currentUserId: number;
  private currentRecipeId: number;
  private currentNewsletterId: number;

  constructor() {
    this.users = new Map();
    this.recipesMap = new Map();
    this.newslettersMap = new Map();
    this.currentUserId = 1;
    this.currentRecipeId = 1;
    this.currentNewsletterId = 1;
    
    // Add some example recipes
    this.createRecipe({
      userId: null,
      title: "Mediterranean Bowl",
      description: "Quinoa, chickpeas, cucumber, tomatoes with lemon-tahini dressing",
      ingredients: "1 cup quinoa, 1 can chickpeas, 1 cucumber, 2 tomatoes, lemon-tahini dressing",
      instructions: "Cook quinoa according to package instructions. Drain and rinse chickpeas. Dice cucumber and tomatoes. Mix all ingredients together and drizzle with lemon-tahini dressing.",
      mealType: "Dinner",
      prepTime: 35,
      servings: 4,
      isSaved: true
    });
    
    this.createRecipe({
      userId: null,
      title: "Berry Smoothie Bowl",
      description: "Frozen berries, banana, yogurt topped with granola and fresh fruit",
      ingredients: "1 cup frozen berries, 1 banana, 1/2 cup yogurt, 1/4 cup granola, fresh fruit for topping",
      instructions: "Blend frozen berries, banana, and yogurt until smooth. Pour into a bowl and top with granola and fresh fruit.",
      mealType: "Breakfast",
      prepTime: 10,
      servings: 2,
      isSaved: true
    });
    
    this.createRecipe({
      userId: null,
      title: "Garlic Herb Chicken",
      description: "Pan-seared chicken with garlic, herbs, and roasted vegetables",
      ingredients: "4 chicken breasts, 4 cloves garlic, mixed herbs, mixed vegetables, olive oil, salt, pepper",
      instructions: "Season chicken with salt, pepper, and herbs. Heat olive oil in a pan and cook chicken until golden. Add minced garlic and cook for another minute. Serve with roasted vegetables.",
      mealType: "Dinner",
      prepTime: 45,
      servings: 4,
      isSaved: true
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      savedRecipes: [] 
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userUpdate: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    // Handle the saved recipes array correctly
    let savedRecipes = existingUser.savedRecipes || [];
    if (userUpdate.savedRecipes) {
      savedRecipes = userUpdate.savedRecipes;
    }
    
    const updatedUser: User = {
      ...existingUser,
      ...userUpdate,
      savedRecipes
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getRecipes(userId?: number): Promise<Recipe[]> {
    const recipes = Array.from(this.recipesMap.values());
    if (userId) {
      return recipes.filter(recipe => recipe.userId === userId);
    }
    return recipes;
  }
  
  async getRecipeById(id: number): Promise<Recipe | undefined> {
    return this.recipesMap.get(id);
  }
  
  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const id = this.currentRecipeId++;
    const now = new Date();
    const recipe: Recipe = { 
      ...insertRecipe, 
      id,
      createdAt: now
    };
    this.recipesMap.set(id, recipe);
    return recipe;
  }
  
  async updateRecipe(id: number, recipeUpdate: Partial<InsertRecipe>): Promise<Recipe | undefined> {
    const existingRecipe = this.recipesMap.get(id);
    if (!existingRecipe) return undefined;
    
    const updatedRecipe: Recipe = {
      ...existingRecipe,
      ...recipeUpdate,
    };
    
    this.recipesMap.set(id, updatedRecipe);
    return updatedRecipe;
  }
  
  async deleteRecipe(id: number): Promise<boolean> {
    return this.recipesMap.delete(id);
  }
  
  async subscribeToNewsletter(email: string): Promise<Newsletter> {
    const existingSubscriber = Array.from(this.newslettersMap.values()).find(
      newsletter => newsletter.email === email
    );
    
    if (existingSubscriber) {
      return existingSubscriber;
    }
    
    const id = this.currentNewsletterId++;
    const now = new Date();
    const newsletter: Newsletter = {
      id,
      email,
      createdAt: now
    };
    
    this.newslettersMap.set(id, newsletter);
    return newsletter;
  }
  
  async getNewsletterSubscribers(): Promise<Newsletter[]> {
    return Array.from(this.newslettersMap.values());
  }
}

export const storage = new MemStorage();
