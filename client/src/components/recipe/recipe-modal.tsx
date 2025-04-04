
import { Recipe } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface RecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function RecipeModal({ recipe, isOpen, onClose }: RecipeModalProps) {
  if (!recipe) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-700">{recipe.title}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{recipe.prepTime} min</span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>{recipe.servings} servings</span>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">{recipe.description}</p>
          
          <Separator className="my-4" />
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-orange-600 mb-2">Ingredients</h3>
              <ul className="list-disc pl-5 space-y-1">
                {recipe.ingredients?.map((ingredient, index) => (
                  <li key={index} className="text-gray-700">{ingredient}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-orange-600 mb-2">Instructions</h3>
              <ol className="list-decimal pl-5 space-y-2">
                {recipe.instructions?.map((instruction, index) => (
                  <li key={index} className="text-gray-700">{instruction}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
