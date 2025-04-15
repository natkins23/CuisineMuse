import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getSavedRecipes, GeneratedRecipe } from '@/lib/recipeApi';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

interface RecipeSidebarProps {
  onSelectRecipe: (recipe: GeneratedRecipe) => void;
  selectedRecipeId?: number;
}

export default function RecipeSidebar({ onSelectRecipe, selectedRecipeId }: RecipeSidebarProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Add Recipe Handler Function
  const handleAddRecipe = () => {
    // Navigate to the chat interface to create a new recipe
    onSelectRecipe(null as any);
    
    // Show a toast to guide the user
    toast({
      title: "Create New Recipe",
      description: "Use the chat interface to create a new recipe",
      duration: 5000
    });
  };
  
  const { 
    data: savedRecipes,
    isLoading, 
    isError,
    error
  } = useQuery({
    queryKey: ['/api/saved-recipes', currentUser?.uid],
    enabled: !!currentUser?.uid,
    queryFn: async () => {
      try {
        if (!currentUser?.uid) return [];
        
        // Convert the Firebase UID to a numeric ID
        // For Firebase auth users, we'll use the last 4 chars of UID converted to an integer
        const uid = currentUser.uid;
        const userId = uid ? 
          parseInt(uid.slice(-4), 16) % 1000 || 1 : 1;
          
        console.log('Firebase UID:', uid);
        console.log('Converted to numeric user ID for saved recipes:', userId);
        
        const recipes = await getSavedRecipes(userId);
        console.log('Fetched saved recipes:', recipes);
        return recipes;
      } catch (error) {
        console.error('Error fetching saved recipes:', error);
        throw error;
      }
    }
  });

  useEffect(() => {
    if (isError && error) {
      toast({
        title: 'Error',
        description: 'Failed to load saved recipes. Please try again.',
        variant: 'destructive',
      });
    }
  }, [isError, error, toast]);

  if (isLoading) {
    return (
      <div className="w-full h-full p-4 border-r">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Saved Recipes</h2>
          <Button 
            variant="secondary" 
            size="sm" 
            className="flex items-center gap-1" 
            onClick={handleAddRecipe}
          >
            <Plus className="h-4 w-4" />
            Add Recipe
          </Button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 border-r">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Saved Recipes</h2>
        <Button 
          variant="secondary" 
          size="sm" 
          className="flex items-center gap-1" 
          onClick={handleAddRecipe}
        >
          <Plus className="h-4 w-4" />
          Add Recipe
        </Button>
      </div>
      
      {(!savedRecipes || savedRecipes.length === 0) ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No saved recipes yet</p>
          <p className="text-sm mt-2">Your saved recipes will appear here</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-4 pr-4">
            {savedRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className={`p-3 rounded-md cursor-pointer transition-colors ${
                  selectedRecipeId === recipe.id
                    ? 'bg-primary/10 border border-primary/30'
                    : 'hover:bg-muted'
                }`}
                onClick={() => onSelectRecipe(recipe)}
              >
                <h3 className="font-medium truncate">{recipe.title}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {recipe.mealType} • {recipe.prepTime} mins
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}