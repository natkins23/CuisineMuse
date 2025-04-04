import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { GeneratedRecipe } from '@/lib/recipeApi';

interface RecipeDisplayProps {
  recipeData: Partial<GeneratedRecipe>;
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipeData }) => {
  // Format lists from string with newlines to arrays
  const formatList = (content: string | undefined): string[] => {
    if (!content) return [];
    return content.split('\n').filter(item => item.trim().length > 0);
  };

  const ingredients = formatList(recipeData.ingredients);
  const instructions = formatList(recipeData.instructions);

  return (
    <Card className="w-full shadow-md">
      <CardContent className="p-6">
        <h1 className="text-2xl font-bold text-green-700 mb-2">{recipeData.title}</h1>
        
        <div className="text-sm text-gray-500 mb-4">
          {recipeData.prepTime && <span>Prep time: {recipeData.prepTime} minutes • </span>}
          {recipeData.servings && <span>Servings: {recipeData.servings}</span>}
        </div>
        
        <p className="text-gray-700 mb-6">{recipeData.description}</p>
        
        <Separator className="my-4" />
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-orange-600 mb-3">Ingredients</h2>
          <ul className="list-disc pl-5 space-y-1">
            {ingredients.map((ingredient, index) => (
              <li key={index} className="text-gray-700">{ingredient}</li>
            ))}
          </ul>
        </div>
        
        <Separator className="my-4" />
        
        <div>
          <h2 className="text-xl font-semibold text-orange-600 mb-3">Instructions</h2>
          <ol className="list-decimal pl-5 space-y-2">
            {instructions.map((step, index) => (
              <li key={index} className="text-gray-700">{step}</li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeDisplay;