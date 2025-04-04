import { Recipe } from "@shared/schema";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Clock, User, X, ChefHat, Utensils, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (recipeId: string) => void;
}

export default function RecipeModal({
  recipe,
  isOpen,
  onClose,
  onDelete,
}: RecipeModalProps) {
  if (!recipe) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Hide default Radix close button */}
      <DialogContent className="max-w-[95vw] sm:max-w-[80vw] h-[90vh] flex flex-col px-4 sm:px-8 py-4 [&>button]:hidden">
        <div className="overflow-y-auto flex-1">
          {/* Title and delete/close button aligned with content */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 px-2 sm:px-4">
            <h2 className="text-xl sm:text-2xl font-bold text-green-700">
              {recipe.title}
            </h2>
            {onDelete ? (
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-700 hover:bg-red-50 self-start sm:self-center"
                onClick={() => {
                  onDelete(recipe.id);
                  onClose();
                }}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="self-start sm:self-center"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Main modal content padded equally */}
          <div className="px-2 sm:px-4 pb-6">
            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
              <Badge
                variant="outline"
                className="px-2 py-1 text-xs bg-orange-50 text-orange-700"
              >
                {recipe.mealType}
              </Badge>
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

            {/* Description */}
            <div className="bg-orange-50 rounded-lg p-4 mb-6">
              <p className="text-base text-gray-700">{recipe.description}</p>
            </div>

            {/* Ingredients and Instructions */}
            <div className="space-y-6">
              {/* Ingredients */}
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Utensils className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-orange-600">
                    Ingredients
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                  {recipe.ingredients?.map((ingredient, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-700 list-none"
                    >
                      <span className="h-2 w-2 rounded-full bg-orange-200" />
                      {ingredient}
                    </li>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <ChefHat className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-orange-600">
                    Instructions
                  </h3>
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
