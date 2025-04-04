
import { Recipe } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, User, X, ChefHat, Utensils } from "lucide-react";
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
      <DialogContent className="max-w-[95vw] h-[95vh] flex flex-col p-0">
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
            <DialogTitle className="text-4xl font-bold text-green-700">{recipe.title}</DialogTitle>
          </DialogHeader>
          
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-8 text-base text-gray-500 mb-8">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                <span>{recipe.prepTime} minutes</span>
              </div>
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                <span>{recipe.servings} servings</span>
              </div>
              <div className="flex items-center">
                <ChefHat className="h-5 w-5 mr-2" />
                <span>Difficulty: Medium</span>
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-8 mb-12">
              <p className="text-xl text-gray-700 leading-relaxed">{recipe.description}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-16">
              <div className="bg-white rounded-lg p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <Utensils className="h-6 w-6 text-orange-600" />
                  <h3 className="text-2xl font-semibold text-orange-600">Ingredients</h3>
                </div>
                <ul className="space-y-4">
                  {recipe.ingredients?.map((ingredient, index) => (
                    <li key={index} className="flex items-center gap-4 text-lg text-gray-700">
                      <span className="h-2.5 w-2.5 rounded-full bg-orange-200" />
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <ChefHat className="h-6 w-6 text-orange-600" />
                  <h3 className="text-2xl font-semibold text-orange-600">Instructions</h3>
                </div>
                <ol className="space-y-6">
                  {recipe.instructions?.map((instruction, index) => (
                    <li key={index} className="flex gap-4 text-gray-700">
                      <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-orange-100 text-orange-600 text-lg font-medium">
                        {index + 1}
                      </span>
                      <p className="text-lg leading-relaxed">{instruction}</p>
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
