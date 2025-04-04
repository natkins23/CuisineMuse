import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, serverTimestamp, Timestamp } from "firebase/firestore";
import { Recipe, User, Newsletter, InsertRecipe, InsertUser, InsertNewsletter } from "../shared/schema";
import { IStorage } from "./storage";
import admin from "./firebase-admin";
import { db } from "./firebase";

// Collections
const USERS_COLLECTION = "users";
const RECIPES_COLLECTION = "recipes";
const NEWSLETTERS_COLLECTION = "newsletters";

// Helper to convert Firestore timestamps to Date
function convertTimestamps<T>(obj: any): T {
  const result = { ...obj };
  
  // Convert Firestore Timestamp objects to JavaScript Date objects
  Object.keys(result).forEach(key => {
    if (result[key] instanceof Timestamp) {
      result[key] = result[key].toDate();
    }
  });
  
  return result as T;
}

/**
 * Firestore implementation of IStorage
 */
export class FirestoreStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, id.toString()));
      if (userDoc.exists()) {
        return convertTimestamps<User>({ id, ...userDoc.data() });
      }
      return undefined;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const q = query(collection(db, USERS_COLLECTION), where("username", "==", username));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return convertTimestamps<User>({ id: parseInt(userDoc.id), ...userDoc.data() });
      }
      
      return undefined;
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Generate an ID for the user (in a real app, we'd handle this differently)
      const id = Date.now();
      const user: User = { ...insertUser, id };
      
      // Save to Firestore
      await setDoc(doc(db, USERS_COLLECTION, id.toString()), user);
      
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  // Recipe methods
  async getRecipes(userId?: number): Promise<Recipe[]> {
    try {
      let recipeQuery;
      
      if (userId) {
        recipeQuery = query(collection(db, RECIPES_COLLECTION), where("userId", "==", userId));
      } else {
        recipeQuery = collection(db, RECIPES_COLLECTION);
      }
      
      const querySnapshot = await getDocs(recipeQuery);
      const recipes: Recipe[] = [];
      
      querySnapshot.forEach((doc) => {
        recipes.push(convertTimestamps<Recipe>({ id: parseInt(doc.id), ...doc.data() }));
      });
      
      return recipes;
    } catch (error) {
      console.error("Error getting recipes:", error);
      return [];
    }
  }

  async getRecipeById(id: number): Promise<Recipe | undefined> {
    try {
      const recipeDoc = await getDoc(doc(db, RECIPES_COLLECTION, id.toString()));
      
      if (recipeDoc.exists()) {
        return convertTimestamps<Recipe>({ id, ...recipeDoc.data() });
      }
      
      return undefined;
    } catch (error) {
      console.error("Error getting recipe by id:", error);
      return undefined;
    }
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    try {
      // Generate an ID for the recipe
      const id = Date.now();
      
      // Prepare the recipe data with timestamps that Firestore expects
      const recipeData = {
        ...insertRecipe, 
        id,
        // Set null values for nullable fields that aren't provided
        userId: insertRecipe.userId ?? null,
        isSaved: insertRecipe.isSaved ?? null,
        createdAt: serverTimestamp() // Firestore's timestamp
      };
      
      // Save to Firestore
      await setDoc(doc(db, RECIPES_COLLECTION, id.toString()), recipeData);
      
      // Return the recipe with proper Date objects
      const recipe: Recipe = {
        ...insertRecipe,
        id,
        userId: insertRecipe.userId ?? null,
        isSaved: insertRecipe.isSaved ?? null,
        createdAt: new Date()
      };
      
      return recipe;
    } catch (error) {
      console.error("Error creating recipe:", error);
      throw error;
    }
  }

  async updateRecipe(id: number, recipeUpdate: Partial<InsertRecipe>): Promise<Recipe | undefined> {
    try {
      const recipeRef = doc(db, RECIPES_COLLECTION, id.toString());
      const recipeDoc = await getDoc(recipeRef);
      
      if (!recipeDoc.exists()) {
        return undefined;
      }
      
      // Get existing data and prepare the update
      const existingData = recipeDoc.data();
      const updateData = { ...recipeUpdate };
      
      // Update the document
      await updateDoc(recipeRef, updateData);
      
      // Get the updated document
      const updatedDoc = await getDoc(recipeRef);
      
      if (updatedDoc.exists()) {
        return convertTimestamps<Recipe>({ id, ...updatedDoc.data() });
      }
      
      return undefined;
    } catch (error) {
      console.error("Error updating recipe:", error);
      return undefined;
    }
  }

  async deleteRecipe(id: number): Promise<boolean> {
    try {
      await deleteDoc(doc(db, RECIPES_COLLECTION, id.toString()));
      return true;
    } catch (error) {
      console.error("Error deleting recipe:", error);
      return false;
    }
  }

  // Newsletter methods
  async subscribeToNewsletter(email: string): Promise<Newsletter> {
    try {
      // Check if email already exists
      const q = query(collection(db, NEWSLETTERS_COLLECTION), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        return convertTimestamps<Newsletter>({ id: parseInt(docSnap.id), ...docSnap.data() });
      }
      
      // Create new subscription
      const id = Date.now();
      const newsletterData = {
        id,
        email,
        createdAt: serverTimestamp()
      };
      
      await setDoc(doc(db, NEWSLETTERS_COLLECTION, id.toString()), newsletterData);
      
      // Return with a JavaScript Date
      const newsletter: Newsletter = {
        id,
        email,
        createdAt: new Date()
      };
      
      return newsletter;
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      throw error;
    }
  }

  async getNewsletterSubscribers(): Promise<Newsletter[]> {
    try {
      const querySnapshot = await getDocs(collection(db, NEWSLETTERS_COLLECTION));
      const newsletters: Newsletter[] = [];
      
      querySnapshot.forEach((doc) => {
        newsletters.push(convertTimestamps<Newsletter>({ id: parseInt(doc.id), ...doc.data() }));
      });
      
      return newsletters;
    } catch (error) {
      console.error("Error getting newsletter subscribers:", error);
      return [];
    }
  }
}

// Create and export an instance of FirestoreStorage
export const firestoreStorage = new FirestoreStorage();