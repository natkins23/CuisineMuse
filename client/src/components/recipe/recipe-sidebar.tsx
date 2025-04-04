
import { Recipe } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, User, Utensils, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RecipeSidebarProps {
  recipes: Recipe[];
  isLoading: boolean;
  onRecipeSelect?: (recipe: Recipe) => void;
  onDelete?: (recipeId: string) => void;
}

export default function RecipeSidebar({ 
  recipes, 
  isLoading,
  onRecipeSelect,
  onDelete 
}: RecipeSidebarProps) {
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-neutral-800">My Saved Recipes</h2>
          {Array(3).fill(0).map((_, i) => (
            <Card key={i} className="cursor-pointer hover:shadow-md transition-all">
              <CardHeader className="p-4 pb-2">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between text-sm text-neutral-500 mt-2">
                  <Skeleton className="h-3 w-1/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-neutral-800">My Saved Recipes</h2>
          <div className="text-sm bg-neutral-100 px-2 py-1 rounded">
            {recipes.length}/3 recipes
          </div>
        </div>
        
        {recipes.length === 0 ? (
          <div className="text-center py-8">
            <Utensils className="h-12 w-12 mx-auto text-neutral-300 mb-2" />
            <p className="text-neutral-500 mb-2">No saved recipes yet</p>
            <p className="text-sm text-neutral-400 mb-4">
              Recipes you save will appear here
            </p>
            <Button
              variant="outline"
              onClick={() => window.scrollTo({ 
                top: document.getElementById('try-it-out')?.offsetTop,
                behavior: 'smooth'
              })}
            >
              Try Creating a Recipe
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recipes.map((recipe) => (
              <Card key={recipe.id} className="hover:shadow-md transition-all">
                <div 
                  className="cursor-pointer"
                  onClick={() => onRecipeSelect && onRecipeSelect(recipe)}
                >
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base font-medium line-clamp-1">
                      {recipe.title}
                    </CardTitle>
                    <p className="text-sm text-neutral-500 line-clamp-1">{recipe.description}</p>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between text-sm text-neutral-500 mt-2">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{recipe.prepTime} min</span>
                      </div>
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        <span>{recipe.servings} servings</span>
                      </div>
                    </div>
                  </CardContent>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    if (onDelete && recipe.id) {
                      onDelete(recipe.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
