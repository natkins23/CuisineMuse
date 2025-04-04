import { useState } from "react";
import { Button } from "@/components/ui/button";
import RecipeCard from "@/components/ui/recipe-card";
import { ArrowRight } from "lucide-react";

// Example usage:
const sampleRecipe = {
  title: "Coq au Vin",
  imageUrl: "https://images.unsplash.com/photo-1600891964092-4316c288032e",
  cookingTime: 90,
  cuisine: "French"
};

<RecipeCard {...sampleRecipe} />

import { motion } from "framer-motion";
import type { Recipe } from "@shared/schema";

interface RecipeShowcaseProps {
  recipes: Recipe[];
}

export default function RecipeShowcase({ recipes }: RecipeShowcaseProps) {
  const [visibleRecipes, setVisibleRecipes] = useState(3);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // If there are no recipes, show a placeholder message
  const noRecipes = recipes.length === 0;

  return (
    <section id="recipes" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-orange-600 font-semibold tracking-wide uppercase">Your Collection</h2>
          <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-neutral-900 sm:text-4xl font-serif">
            Saved Recipes
          </p>
          <p className="mt-4 max-w-2xl text-xl text-neutral-600 mx-auto">
            Save your favorite recipes for quick access anytime.
          </p>
        </div>

        {noRecipes ? (
          <div className="mt-12 text-center p-8 bg-neutral-50 rounded-lg shadow-sm max-w-2xl mx-auto">
            <p className="text-lg text-neutral-600">
              You haven't saved any recipes yet. Create a recipe using the assistant above and save your favorites!
            </p>
          </div>
        ) : (
          <>
            <motion.div 
              className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              {recipes.slice(0, visibleRecipes).map((recipe) => (
                <motion.div key={recipe.id} variants={itemVariants}>
                  <RecipeCard recipe={recipe} />
                </motion.div>
              ))}
            </motion.div>

            {recipes.length > visibleRecipes && (
              <div className="mt-10 text-center">
                <Button 
                  variant="ghost" 
                  className="inline-flex items-center text-green-600 font-medium hover:text-green-800"
                  onClick={() => setVisibleRecipes(recipes.length)}
                >
                  View all saved recipes
                  <ArrowRight className="h-5 w-5 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
