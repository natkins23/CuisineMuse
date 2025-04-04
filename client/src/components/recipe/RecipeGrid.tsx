import React from 'react';
import { RecipeSuggestion } from '@/lib/recipeApi';
import RecipeCard from './RecipeCard';

interface RecipeGridProps {
  recipes: RecipeSuggestion[];
}

const RecipeGrid: React.FC<RecipeGridProps> = ({ recipes }) => {
  if (!recipes || recipes.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No recipes available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {recipes.map((recipe, index) => (
        <div key={`${recipe.title}-${index}`}>
          <RecipeCard recipe={recipe} />
        </div>
      ))}
    </div>
  );
};

export default RecipeGrid;