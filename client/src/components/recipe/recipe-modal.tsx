
import { Recipe } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, User, X, ChefHat, Utensils } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function RecipeModal({ recipe, isOpen, onClose }: RecipeModalProps) {
  if (!recipe) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <div className="p-8 overflow-y-auto flex-1">
          <DialogHeader className="relative mb-8">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-0 top-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
            <Badge variant="outline" className="mb-4 bg-orange-50 text-orange-700">
              {recipe.mealType}
            </Badge>
            <DialogTitle className="text-3xl font-bold text-green-700">{recipe.title}</DialogTitle>
          </DialogHeader>
          
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-6 text-sm text-gray-500 mb-8">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>{recipe.prepTime} minutes</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>{recipe.servings} servings</span>
              </div>
              <div className="flex items-center">
                <ChefHat className="h-4 w-4 mr-2" />
                <span>Difficulty: Medium</span>
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-6 mb-8">
              <p className="text-lg text-gray-700 leading-relaxed">{recipe.description}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Utensils className="h-5 w-5 text-orange-600" />
                  <h3 className="text-xl font-semibold text-orange-600">Ingredients</h3>
                </div>
                <ul className="space-y-3">
                  {recipe.ingredients?.map((ingredient, index) => (
                    <li key={index} className="flex items-center gap-3 text-gray-700">
                      <span className="h-2 w-2 rounded-full bg-orange-200" />
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <ChefHat className="h-5 w-5 text-orange-600" />
                  <h3 className="text-xl font-semibold text-orange-600">Instructions</h3>
                </div>
                <ol className="space-y-4">
                  {recipe.instructions?.map((instruction, index) => (
                    <li key={index} className="flex gap-4 text-gray-700">
                      <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-orange-100 text-orange-600 text-sm font-medium">
                        {index + 1}
                      </span>
                      <p className="leading-relaxed">{instruction}</p>
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
