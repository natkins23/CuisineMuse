import React, { useState } from 'react';
import { GeneratedRecipe, saveRecipe, unsaveRecipe } from '@/lib/recipeApi';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Bookmark, Send, BookmarkCheck } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface RecipeDisplayProps {
  recipe: GeneratedRecipe;
  onEmailRecipe?: (recipe: GeneratedRecipe) => void;
}

export default function RecipeDisplay({ recipe, onEmailRecipe }: RecipeDisplayProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [isSaved, setIsSaved] = useState(recipe.isSaved || false);

  const saveMutation = useMutation({
    mutationFn: async ({ recipeId, userId }: { recipeId: number, userId: number }) => {
      return isSaved 
        ? unsaveRecipe(recipeId, userId)
        : saveRecipe(recipeId, userId);
    },
    onSuccess: () => {
      // Update saved state
      setIsSaved(!isSaved);
      
      // Show success message
      toast({
        title: isSaved ? 'Recipe removed' : 'Recipe saved',
        description: isSaved 
          ? 'Recipe has been removed from your saved recipes'
          : 'Recipe has been saved to your account',
      });
      
      // Invalidate the saved recipes query
      queryClient.invalidateQueries({ queryKey: ['/api/saved-recipes'] });
    },
    onError: (error) => {
      console.error('Error saving recipe:', error);
      toast({
        title: 'Error',
        description: 'Failed to save recipe. Please try again.',
        variant: 'destructive',
      });
    }
  });

  const handleToggleSave = () => {
    if (!currentUser) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save recipes',
        variant: 'destructive',
      });
      return;
    }

    if (!recipe.id) {
      toast({
        title: 'Error',
        description: 'Cannot save this recipe at the moment.',
        variant: 'destructive',
      });
      return;
    }

    // For now, we'll use user ID 1 since we're using in-memory storage
    // In a real app, you'd use currentUser.uid or a mapping from Firebase UID to your database ID
    saveMutation.mutate({ 
      recipeId: recipe.id,
      userId: 1
    });
  };

  const handleEmailRecipe = () => {
    if (onEmailRecipe) {
      onEmailRecipe(recipe);
    }
  };

  const isPending = saveMutation.isPending;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{recipe.title}</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            title={isSaved ? "Remove from saved recipes" : "Save recipe"}
            onClick={handleToggleSave}
            disabled={isPending}
          >
            {isSaved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            title="Email recipe"
            onClick={handleEmailRecipe}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="bg-muted px-3 py-1 rounded-md">
          <span className="font-medium">Prep time:</span> {recipe.prepTime} minutes
        </div>
        <div className="bg-muted px-3 py-1 rounded-md">
          <span className="font-medium">Servings:</span> {recipe.servings}
        </div>
        <div className="bg-muted px-3 py-1 rounded-md">
          <span className="font-medium">Type:</span> {recipe.mealType}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Description</h2>
        <p className="text-gray-700">{recipe.description}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Ingredients</h2>
        <div className="bg-muted/50 p-4 rounded-md">
          {recipe.ingredients.split(',').map((ingredient, index) => (
            <div key={index} className="flex items-baseline mb-2">
              <span className="mr-2 text-primary">•</span>
              <span>{ingredient.trim()}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Instructions</h2>
        <div className="space-y-4">
          {recipe.instructions.split('.').filter(s => s.trim()).map((step, index) => (
            <div key={index} className="flex">
              <div className="mr-4 flex-shrink-0">
                <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center">
                  {index + 1}
                </div>
              </div>
              <p>{step.trim()}.</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}