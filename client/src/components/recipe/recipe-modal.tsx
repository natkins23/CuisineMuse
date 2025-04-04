
import { Recipe } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, User, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface RecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function RecipeModal({ recipe, isOpen, onClose }: RecipeModalProps) {
  if (!recipe) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full h-[100vh] flex flex-col p-0">
        <div className="p-6 overflow-y-auto flex-1">
          <DialogHeader className="relative mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-0 top-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
            <DialogTitle className="text-3xl font-bold text-green-700">{recipe.title}</DialogTitle>
          </DialogHeader>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>{recipe.prepTime} minutes</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>{recipe.servings} servings</span>
              </div>
            </div>
            
            <p className="text-lg text-gray-700 mb-8">{recipe.description}</p>
            
            <Separator className="my-8" />
            
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-semibold text-orange-600 mb-4">Ingredients</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {recipe.ingredients?.map((ingredient, index) => (
                    <li key={index} className="text-gray-700">{ingredient}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-orange-600 mb-4">Instructions</h3>
                <ol className="list-decimal pl-5 space-y-3">
                  {recipe.instructions?.map((instruction, index) => (
                    <li key={index} className="text-gray-700">{instruction}</li>
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
