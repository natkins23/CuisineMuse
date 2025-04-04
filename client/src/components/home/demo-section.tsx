import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SuggestionChip from "@/components/ui/suggestion-chip";
import RateLimitNotification from "@/components/ui/rate-limit-notification";
import { Zap, User, FileDown, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage, RecipeSuggestion, sendChatMessage } from "@/lib/recipeApi";
import { useToast } from "@/hooks/use-toast";
import RecipeGrid from "@/components/recipe/RecipeGrid";
import DetailedRecipeCard from "@/components/recipe/DetailedRecipeCard";

// Demo suggestion categories
const mealTypes = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack", "Appetizer"];
const proteinSuggestions = ["Chicken", "Beef", "Fish", "Pork", "Tofu", "Beans", "Eggs"];
const dietarySuggestions = ["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Low-carb"];
const ingredientSuggestions = ["Broccoli", "Bell peppers", "Zucchini", "Spinach", "Potatoes", "Rice", "Pasta"];
const timeSuggestions = ["Under 30 minutes", "Quick & Easy", "One-pot meal"];

export default function DemoSection() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I'm your CulinaryMuse assistant. What kind of recipe would you like to create today?"
    }
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Track selected options from each category
  const [selectedMealType, setSelectedMealType] = useState<string | undefined>();
  const [selectedProtein, setSelectedProtein] = useState<string | undefined>();
  const [selectedDietary, setSelectedDietary] = useState<string | undefined>();
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedTimeOption, setSelectedTimeOption] = useState<string | undefined>();
  
  // Legacy states for backward compatibility
  const [currentMealType, setCurrentMealType] = useState<string | undefined>();
  const [currentIngredient, setCurrentIngredient] = useState<string | undefined>();
  
  // Rate limit notification state
  const [showRateLimitNotification, setShowRateLimitNotification] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState<string>();
  
  // Control visibility of suggestion sections
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  // Store recipe suggestions from the API
  const [recipeSuggestions, setRecipeSuggestions] = useState<RecipeSuggestion[]>([]);
  
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    // Add user message
    const userMessage: ChatMessage = { 
      role: "user", 
      content: inputValue 
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);
    
    try {
      // Extract meal type, protein, dietary restrictions, and ingredient info from inputs
      const lowerInput = inputValue.toLowerCase();
      let detectedMealType = currentMealType;
      let detectedIngredient = currentIngredient;
      let detectedProtein;
      let detectedDietary;
      
      // Simple detection for meal type - this could be more sophisticated
      if (!detectedMealType) {
        for (const type of mealTypes) {
          if (lowerInput.includes(type.toLowerCase())) {
            detectedMealType = type;
            setCurrentMealType(type);
            break;
          }
        }
      }
      
      // Check for protein mentions
      for (const protein of proteinSuggestions) {
        if (lowerInput.includes(protein.toLowerCase())) {
          detectedProtein = protein;
          break;
        }
      }
      
      // Check for dietary restrictions
      for (const dietary of dietarySuggestions) {
        if (lowerInput.includes(dietary.toLowerCase())) {
          detectedDietary = dietary;
          break;
        }
      }
      
      // Check for main ingredient mentions
      for (const ingredient of ingredientSuggestions) {
        const ingredientLower = ingredient.toLowerCase();
        if (lowerInput.includes(ingredientLower)) {
          detectedIngredient = ingredient;
          setCurrentIngredient(ingredient);
          break;
        }
      }
      
      // Send to API
      const response = await sendChatMessage({
        messages: newMessages,
        mealType: detectedMealType,
        mainIngredient: detectedIngredient || detectedProtein,
        dietary: detectedDietary?.toLowerCase()
      });
      
      // Add AI response to chat
      setMessages([...newMessages, response.message]);
      
      // Check for recipe suggestions in the response
      if (response.suggestions && response.suggestions.length > 0) {
        // Store the recipe suggestions
        setRecipeSuggestions(response.suggestions);
        // Hide the suggestions UI when displaying recipe results
        setShowSuggestions(false);
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      
      // Check if this is a rate limit error (status code 429)
      if (error.response?.status === 429 || 
          (typeof error === 'object' && error.message?.includes('rate limit'))) {
        // Show the rate limit notification
        setRateLimitMessage("You've reached the rate limit for AI requests. Please try again in a few minutes.");
        setShowRateLimitNotification(true);
      } else {
        // Show general error toast for other errors
        toast({
          title: "Error",
          description: "Failed to get a response. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChipClick = (chipText: string, category: 'mealType' | 'protein' | 'dietary' | 'ingredient' | 'time') => {
    // Add to input field
    setInputValue(prev => prev ? `${prev}, ${chipText.toLowerCase()}` : chipText);
    
    // Update selected state based on category
    switch (category) {
      case 'mealType':
        setSelectedMealType(chipText);
        setCurrentMealType(chipText); // For backward compatibility
        break;
      case 'protein':
        setSelectedProtein(chipText);
        break;
      case 'dietary':
        setSelectedDietary(chipText);
        break;
      case 'ingredient':
        setSelectedIngredients(prev => [...prev, chipText]);
        setCurrentIngredient(chipText); // For backward compatibility
        break;
      case 'time':
        setSelectedTimeOption(chipText);
        break;
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };
  
  const handleCloseRateLimitNotification = () => {
    setShowRateLimitNotification(false);
  };

  return (
    <section id="how-it-works" className="py-16 bg-green-50">
      {/* Rate limit notification */}
      {showRateLimitNotification && (
        <RateLimitNotification 
          message={rateLimitMessage}
          onClose={handleCloseRateLimitNotification}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-orange-600 font-semibold tracking-wide uppercase">How It Works</h2>
          <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-neutral-900 sm:text-4xl font-serif">
            Create Recipes in Seconds
          </p>
          <p className="mt-4 max-w-2xl text-xl text-neutral-600 mx-auto">
            A simple, conversational approach to cooking inspiration.
          </p>
        </div>

        <motion.div 
          className="mt-12 lg:mt-16 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Chat Interface Header */}
            <div className="bg-green-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquareIcon className="h-6 w-6 mr-2" />
                <h3 className="font-medium text-lg">Recipe Assistant</h3>
              </div>
              <button className="p-2 rounded-full hover:bg-green-700 transition-all">
                <DotsIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="px-6 py-4 h-96 overflow-y-auto bg-neutral-50">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div 
                    key={index}
                    className={`flex items-start mb-4 ${message.role === "user" ? "justify-end" : ""}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0 mr-3">
                        <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white">
                          <Zap className="h-5 w-5" />
                        </div>
                      </div>
                    )}
                    <div className={`rounded-lg p-4 max-w-md ${
                      message.role === "assistant" 
                        ? "bg-white shadow-sm" 
                        : "bg-orange-100"
                    }`}>
                      <p className="text-neutral-800">
                        {message.content}
                      </p>
                      {message.recipe && (
                        <div className="mt-2">
                          <div className="border-l-4 border-green-400 pl-3 my-2">
                            <p className="font-medium text-neutral-800">{message.recipe.title}</p>
                            <p className="text-sm text-neutral-600 mt-1">Ready in {message.recipe.time} • {message.recipe.servings}</p>
                          </div>
                          <button className="mt-3 flex items-center text-green-600 text-sm font-medium hover:text-green-800">
                            <FileDown className="h-4 w-4 mr-1" />
                            Save this recipe
                          </button>
                        </div>
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="flex-shrink-0 ml-3">
                        <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
                          <User className="h-5 w-5" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Show suggestions based on conversation state, not just message count */}
              {showSuggestions && (
                <div className="space-y-4 mt-4">
                  {/* Meal type suggestions */}
                  <div>
                    <h4 className="text-sm font-medium text-neutral-500 mb-2">What meal are you looking for?</h4>
                    <div className="flex flex-wrap gap-2">
                      {mealTypes.map((mealType, index) => {
                        const isSelected = selectedMealType === mealType;
                        // If a meal type is selected, only show selected one with normal opacity
                        const shouldDisplay = !selectedMealType || isSelected;
                        
                        return shouldDisplay && (
                          <motion.div
                            key={index}
                            initial={{ opacity: 1 }}
                            animate={{ 
                              opacity: selectedMealType && !isSelected ? 0.5 : 1,
                              scale: isSelected ? 1.05 : 1
                            }}
                          >
                            <SuggestionChip 
                              text={mealType}
                              onClick={() => handleChipClick(mealType, 'mealType')}
                            />
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Only show remaining suggestions if a meal type has been selected */}
                  {selectedMealType && (
                    <>
                      {/* Protein suggestions */}
                      <div>
                        <h4 className="text-sm font-medium text-neutral-500 mb-2">Main protein</h4>
                        <div className="flex flex-wrap gap-2">
                          {proteinSuggestions.map((protein, index) => {
                            const isSelected = selectedProtein === protein;
                            // If a protein is selected, only show selected one with normal opacity
                            const shouldDisplay = !selectedProtein || isSelected;
                            
                            return (
                              <motion.div
                                key={index}
                                initial={{ opacity: 1 }}
                                animate={{ 
                                  opacity: selectedProtein && !isSelected ? 0.5 : 1,
                                  scale: isSelected ? 1.05 : 1
                                }}
                              >
                                <SuggestionChip 
                                  text={protein}
                                  variant="blue"
                                  onClick={() => handleChipClick(protein, 'protein')}
                                />
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Dietary suggestions */}
                      <div>
                        <h4 className="text-sm font-medium text-neutral-500 mb-2">Dietary preferences</h4>
                        <div className="flex flex-wrap gap-2">
                          {dietarySuggestions.map((dietary, index) => {
                            const isSelected = selectedDietary === dietary;
                            // If dietary preference is selected, only show selected one with normal opacity
                            const shouldDisplay = !selectedDietary || isSelected;
                            
                            return (
                              <motion.div
                                key={index}
                                initial={{ opacity: 1 }}
                                animate={{ 
                                  opacity: selectedDietary && !isSelected ? 0.5 : 1,
                                  scale: isSelected ? 1.05 : 1
                                }}
                              >
                                <SuggestionChip 
                                  text={dietary}
                                  variant="purple"
                                  onClick={() => handleChipClick(dietary, 'dietary')}
                                />
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Ingredient suggestions */}
                      <div>
                        <h4 className="text-sm font-medium text-neutral-500 mb-2">Main ingredients</h4>
                        <div className="flex flex-wrap gap-2">
                          {ingredientSuggestions.map((ingredient, index) => {
                            const isSelected = selectedIngredients.includes(ingredient);
                            
                            return (
                              <motion.div
                                key={index}
                                initial={{ opacity: 1 }}
                                animate={{ 
                                  opacity: selectedIngredients.length > 0 && !isSelected ? 0.5 : 1,
                                  scale: isSelected ? 1.05 : 1
                                }}
                              >
                                <SuggestionChip 
                                  text={ingredient}
                                  variant="green"
                                  onClick={() => handleChipClick(ingredient, 'ingredient')}
                                />
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Time suggestions */}
                      <div>
                        <h4 className="text-sm font-medium text-neutral-500 mb-2">Time considerations</h4>
                        <div className="flex flex-wrap gap-2">
                          {timeSuggestions.map((time, index) => {
                            const isSelected = selectedTimeOption === time;
                            // If time option is selected, only show selected one with normal opacity
                            const shouldDisplay = !selectedTimeOption || isSelected;
                            
                            return (
                              <motion.div
                                key={index}
                                initial={{ opacity: 1 }}
                                animate={{ 
                                  opacity: selectedTimeOption && !isSelected ? 0.5 : 1,
                                  scale: isSelected ? 1.05 : 1
                                }}
                              >
                                <SuggestionChip 
                                  text={time}
                                  variant="orange"
                                  onClick={() => handleChipClick(time, 'time')}
                                />
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="border-t border-neutral-200 px-6 py-4">
              <div className="flex">
                <Input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about a recipe or ingredient..."
                  disabled={isLoading}
                  className="flex-1 border border-neutral-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <Button 
                  onClick={handleSend}
                  disabled={isLoading}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-r-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRightIcon className="h-5 w-5" />}
                </Button>
              </div>
              {isLoading && (
                <div className="flex items-center justify-center mt-3">
                  <p className="text-sm text-neutral-500">Cooking up a response...</p>
                </div>
              )}
            </div>
          </div>

          {/* Recipe Card for displaying structured recipe data */}
          {recipeSuggestions.length > 0 && (
            <motion.div 
              className="mt-10 bg-white rounded-xl shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="bg-orange-500 text-white px-6 py-3">
                <h3 className="font-medium">Generated Recipe</h3>
              </div>
              <div className="p-4">
                {/* Get the last message with a recipe */}
                {(() => {
                  // Find the last message that has recipe data
                  const recipeMessage = [...messages].reverse().find(m => m.recipe?.recipeData);
                  
                  if (recipeMessage?.recipe?.recipeData && recipeSuggestions[0]) {
                    return (
                      <DetailedRecipeCard
                        title={recipeSuggestions[0].title}
                        image={recipeSuggestions[0].image_url}
                        time={recipeSuggestions[0].cooking_time}
                        servings={recipeMessage.recipe.servings || "4 servings"}
                        description={recipeSuggestions[0].description}
                        recipeData={recipeMessage.recipe.recipeData}
                      />
                    );
                  } else {
                    // Fallback to simple recipe grid if no detailed data is available
                    return <RecipeGrid recipes={recipeSuggestions} />;
                  }
                })()}
              </div>
              <div className="p-4 text-center">
                <Button 
                  onClick={() => { setRecipeSuggestions([]); setShowSuggestions(true); }}
                  variant="outline"
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  Go back to suggestions
                </Button>
              </div>
            </motion.div>
          )}
          
          <div className="mt-8 text-center">
            <p className="text-neutral-600 text-sm">Powered by Google Gemini AI</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Simple icon components
function MessageSquareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  );
}

function DotsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
    </svg>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
    </svg>
  );
}
