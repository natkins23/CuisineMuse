import React from 'react';
import { RecipeSuggestion } from '@/lib/recipeApi';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface RecipeCardProps {
  recipe: RecipeSuggestion;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <Card className="h-full overflow-hidden flex flex-col transition-all duration-200 hover:shadow-md">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={recipe.image_url} 
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium">{recipe.title}</CardTitle>
        <div className="flex items-center mt-1">
          <Clock className="h-4 w-4 mr-1 text-gray-500" />
          <CardDescription className="text-sm font-medium">
            {recipe.cooking_time}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-gray-600 text-sm">{recipe.description}</p>
      </CardContent>
      <CardFooter className="pt-2 pb-4">
        <Badge variant="outline" className="bg-orange-50 text-orange-700 hover:bg-orange-100">
          View Recipe
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default RecipeCard;