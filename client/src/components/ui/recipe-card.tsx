import { Card, CardContent } from "@/components/ui/card";
import { MoreVertical, Clock, Users, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Recipe } from "@shared/schema";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mealTypeColors: Record<string, string> = {
    "Breakfast": "bg-orange-100 text-orange-800",
    "Lunch": "bg-green-100 text-green-800",
    "Dinner": "bg-green-100 text-green-800",
    "Dessert": "bg-purple-100 text-purple-800",
    "Snack": "bg-blue-100 text-blue-800"
  };
  
  const mealTypeColor = mealTypeColors[recipe.mealType] || "bg-green-100 text-green-800";
  
  // Determine image based on meal type for demo purposes
  const getImageUrl = (mealType: string) => {
    switch(mealType) {
      case "Breakfast":
        return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80";
      case "Lunch":
        return "https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80";
      case "Dinner":
        return "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80";
      default:
        return "https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1350&q=80";
    }
  };

  return (
    <Card className="recipe-card rounded-xl shadow-md overflow-hidden bg-white border border-neutral-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="h-48 w-full overflow-hidden">
        <img 
          className="h-full w-full object-cover" 
          src={getImageUrl(recipe.mealType)} 
          alt={recipe.title} 
        />
      </div>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <span className={`inline-block ${mealTypeColor} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
              {recipe.mealType}
            </span>
            <h3 className="text-lg font-medium text-neutral-900 mt-2">{recipe.title}</h3>
          </div>
          <button className="text-neutral-400 hover:text-orange-500">
            <MoreVertical className="h-6 w-6" />
          </button>
        </div>
        <p className="mt-1 text-neutral-600 text-sm">{recipe.description}</p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center text-sm">
            <span className="flex items-center text-neutral-500">
              <Clock className="h-4 w-4 mr-1" />
              {recipe.prepTime} mins
            </span>
            <span className="mx-2 text-neutral-300">|</span>
            <span className="flex items-center text-neutral-500">
              <Users className="h-4 w-4 mr-1" />
              {recipe.servings} servings
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={currentUser ? handleSave : () => setIsModalOpen(true)}
            className="hover:text-orange-500"
          >
            <BookmarkPlus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
