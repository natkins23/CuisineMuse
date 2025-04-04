
import { Recipe } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, User, X, ChefHat, Utensils, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (recipeId: string) => void;
}

export default function RecipeModal({ recipe, isOpen, onClose, onDelete }: RecipeModalProps) {
  if (!recipe) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[80vw] h-[80vh] flex flex-col p-0">
        <div className="p-6 overflow-y-auto flex-1">
          <DialogHeader className="relative px-0 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <Badge variant="outline" className="mb-2 px-2 py-1 text-xs bg-orange-50 text-orange-700">
                  {recipe.mealType}
                </Badge>
                <DialogTitle className="text-2xl font-bold text-green-700">{recipe.title}</DialogTitle>
              </div>
              <div className="flex gap-2">
                {onDelete && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      onDelete(recipe.id);
                      onClose();
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{recipe.prepTime} minutes</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>{recipe.servings} servings</span>
              </div>
              <div className="flex items-center">
                <ChefHat className="h-4 w-4 mr-1" />
                <span>Difficulty: Medium</span>
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4 mb-6">
              <p className="text-base text-gray-700">{recipe.description}</p>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Utensils className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-orange-600">Ingredients</h3>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                  {recipe.ingredients?.map((ingredient, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-700 list-none">
                      <span className="h-2 w-2 rounded-full bg-orange-200" />
                      {ingredient}
                    </li>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <ChefHat className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-orange-600">Instructions</h3>
                </div>
                <ol className="space-y-3">
                  {recipe.instructions?.map((instruction, index) => (
                    <li key={index} className="flex gap-3 text-gray-700">
                      <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-orange-100 text-orange-600 text-sm font-medium">
                        {index + 1}
                      </span>
                      <p className="text-sm leading-relaxed">{instruction}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
