import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users, BookOpen, List, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { GeneratedRecipe } from '@/lib/recipeApi';

interface DetailedRecipeCardProps {
  title: string;
  image: string;
  time: string;
  servings: string;
  description: string;
  recipeData?: Partial<GeneratedRecipe>;
}

const DetailedRecipeCard: React.FC<DetailedRecipeCardProps> = ({
  title,
  image,
  time,
  servings,
  description,
  recipeData
}) => {
  const [expanded, setExpanded] = React.useState(false);

  // Handle when ingredients or instructions are in string or array format
  const formatList = (content: string | string[] | undefined): string[] => {
    if (!content) return [];
    if (Array.isArray(content)) return content;
    
    // Split by newline if it's a string
    return content.split('\n').filter(item => item.trim().length > 0);
  };

  const ingredients = formatList(recipeData?.ingredients);
  const instructions = formatList(recipeData?.instructions);

  return (
    <Card className="w-full overflow-hidden shadow-lg">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
          <div className="p-6 text-white">
            <h2 className="text-2xl font-bold">{title}</h2>
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm">{time}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span className="text-sm">{servings}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-green-700 font-medium">About This Recipe</CardTitle>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-700">{description}</p>

        <Separator className="my-4" />

        <Button 
          variant="outline"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Hide Recipe Details
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Show Recipe Details
            </>
          )}
        </Button>

        {expanded && (
          <div className="mt-4 space-y-6">
            {ingredients.length > 0 && (
              <div>
                <h3 className="flex items-center text-lg font-medium text-orange-600 mb-2">
                  <List className="h-5 w-5 mr-2" />
                  Ingredients
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {ingredients.map((ingredient, index) => (
                    <li key={index} className="text-gray-700">{ingredient}</li>
                  ))}
                </ul>
              </div>
            )}

            {instructions.length > 0 && (
              <div>
                <h3 className="flex items-center text-lg font-medium text-orange-600 mb-2">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Instructions
                </h3>
                <ol className="list-decimal pl-5 space-y-2">
                  {instructions.map((step, index) => (
                    <li key={index} className="text-gray-700">{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DetailedRecipeCard;