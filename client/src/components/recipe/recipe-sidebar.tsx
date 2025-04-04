import { Recipe } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, User, Utensils, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from 'react'; // Added import for useState

interface RecipeSidebarProps {
  recipes: Recipe[];
  isLoading: boolean;
  onRecipeSelect?: (recipe: Recipe) => void;
  onDelete?: (recipeId: string) => void;
}

// RecipeModal component
const RecipeModal = ({ recipe, isOpen, onClose }: { recipe: Recipe; isOpen: boolean; onClose: () => void }) => {
  if (!isOpen || !recipe) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">{recipe.title}</h2>
        <p>{recipe.description}</p>
        {/* Add other recipe details here */}
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-800 text-white rounded">Close</button>
      </div>
    </div>
  );
};


export default function RecipeSidebar({
  recipes,
  isLoading,
  onRecipeSelect,
  onDelete,
}: RecipeSidebarProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-neutral-800">
            My Saved Recipes
          </h2>
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Card
                key={i}
                className="cursor-pointer hover:shadow-md transition-all"
              >
                <CardHeader className="p-4 pb-2">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center justify-between text-sm text-neutral-500 mt-2">
                    <Skeleton className="h-3 w-1/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    );
  }

  const mockRecipes = [
    {
      id: '1',
      title: 'Mediterranean Quinoa Bowl',
      description: 'A vibrant and nutritious bowl featuring quinoa, fresh vegetables, and Mediterranean flavors',
      prepTime: 25,
      servings: 2,
      ingredients: [
        '1 cup quinoa',
        '2 cups vegetable broth',
        '1 cucumber, diced',
        '2 cups cherry tomatoes, halved',
        '1 red onion, finely chopped',
        '1 cup kalamata olives',
        '200g feta cheese, crumbled',
        '2 tbsp olive oil',
        '1 lemon, juiced',
        'Fresh parsley and mint',
        'Salt and pepper to taste'
      ],
      instructions: [
        'Rinse quinoa and cook in vegetable broth according to package instructions',
        'While quinoa cooks, prepare all vegetables',
        'In a large bowl, combine cooked quinoa with diced cucumber, tomatoes, and red onion',
        'Add kalamata olives and crumbled feta cheese',
        'Drizzle with olive oil and lemon juice',
        'Season with salt and pepper',
        'Garnish with fresh herbs and serve'
      ],
      mealType: 'Lunch',
      isSaved: true
    },
    {
      id: '2',
      title: 'Classic Beef Bourguignon',
      description: 'Traditional French beef stew braised in red wine with mushrooms and pearl onions',
      prepTime: 180,
      servings: 6,
      ingredients: [
        '1kg beef chuck, cut into chunks',
        '200g bacon lardons',
        '24 pearl onions',
        '500g mushrooms',
        '750ml red wine (Burgundy)',
        '2 carrots, sliced',
        '1 onion, diced',
        '3 cloves garlic, minced',
        '2 tbsp tomato paste',
        '1 bouquet garni (thyme, parsley, bay leaf)',
        'Salt and pepper to taste'
      ],
      instructions: [
        'Brown the beef chunks in batches, set aside',
        'Cook bacon lardons until crispy, remove from pot',
        'Sauté pearl onions and mushrooms, set aside',
        'Cook diced onion, carrots, and garlic in the same pot',
        'Add tomato paste and cook for 1 minute',
        'Return beef to pot, add wine and bouquet garni',
        'Simmer for 2.5 hours until beef is tender',
        'Add reserved bacon, onions, and mushrooms',
        'Cook for additional 30 minutes',
        'Season to taste and serve hot'
      ],
      mealType: 'Dinner',
      isSaved: true
    },
    {
      id: '3',
      title: 'Lemon Lavender Shortbread',
      description: 'Delicate shortbread cookies infused with fresh lemon zest and dried lavender',
      prepTime: 45,
      servings: 24,
      ingredients: [
        '250g butter, softened',
        '120g powdered sugar',
        '280g all-purpose flour',
        '1/4 tsp salt',
        '2 tbsp lemon zest',
        '1 tbsp dried culinary lavender',
        '1 tsp vanilla extract',
        'Additional powdered sugar for dusting'
      ],
      instructions: [
        'Cream butter and powdered sugar until light and fluffy',
        'Add vanilla extract and lemon zest',
        'Gradually mix in flour and salt',
        'Fold in dried lavender',
        'Roll dough into a log and chill for 30 minutes',
        'Preheat oven to 350°F (175°C)',
        'Slice dough into 1/4 inch rounds',
        'Bake for 12-15 minutes until edges are lightly golden',
        'Cool completely and dust with powdered sugar'
      ],
      mealType: 'Dessert',
      isSaved: true
    }
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-neutral-800">
            My Saved Recipes
          </h2>
          <div className="text-sm bg-neutral-100 px-2 py-1 rounded">
            {recipes.length}/3 recipes
          </div>
        </div>

        {recipes.length === 0 ? (
          <div className="text-center py-8">
            <Utensils className="h-12 w-12 mx-auto text-neutral-300 mb-2" />
            <p className="text-neutral-500 mb-2">No saved recipes yet</p>
            <p className="text-sm text-neutral-400 mb-4">
              Recipes you save will appear here
            </p>
            <Button
              variant="outline"
              onClick={() =>
                window.scrollTo({
                  top: document.getElementById("try-it-out")?.offsetTop,
                  behavior: "smooth",
                })
              }
            >
              Try Creating a Recipe
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {mockRecipes.map((recipe) => ( // Changed to use mockRecipes
              <Card key={recipe.id} className="hover:shadow-md transition-all">
                <div
                  className="cursor-pointer"
                  onClick={() => handleRecipeClick(recipe)}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className=" flex justify-between">
                      <CardTitle className="text-base font-medium line-clamp-1">
                        {recipe.title}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                        onClick={() => {
                          if (onDelete && recipe.id) {
                            onDelete(recipe.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-neutral-500 line-clamp-1">
                      {recipe.description}
                    </p>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between text-sm text-neutral-500 mt-2">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{recipe.prepTime} min</span>
                      </div>
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        <span>{recipe.servings} servings</span>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <RecipeModal 
        recipe={selectedRecipe}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </ScrollArea>
  );
}