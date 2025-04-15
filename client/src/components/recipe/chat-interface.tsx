import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SuggestionChip from "@/components/ui/suggestion-chip-updated";
import RateLimitNotification from "@/components/ui/rate-limit-notification";
import { Zap, User, FileDown, Loader2, Save, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChatMessage, 
  sendChatMessage, 
  EmailRecipeRequest, 
  sendRecipeByEmail,
  saveRecipe,
  getSavedRecipes,
  GeneratedRecipe
} from "@/lib/recipeApi";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import RecipeDetailsModal from "./recipe-details-modal";

// Demo suggestion categories
const mealTypes = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack", "Appetizer"];
const proteinSuggestions = ["Chicken", "Beef", "Fish", "Pork", "Tofu", "Beans", "Eggs"];
const dietarySuggestions = ["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Low-carb"];
const timeSuggestions = ["Under 30 minutes", "Quick & Easy", "One-pot meal"];

// Proteins that are not vegan or vegetarian
const nonVeganProteins = ["Chicken", "Beef", "Fish", "Pork", "Eggs"];
const nonVegetarianProteins = ["Chicken", "Beef", "Fish", "Pork"];

export default function ChatInterface() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Bonjour! I am Chef Pierre, your personal CulinaryMuse assistant. What delightful recipe would you like me to 'elp you create today? Magnifique!"
    }
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingRecipe, setIsSavingRecipe] = useState(false);
  const [isEmailingRecipe, setIsEmailingRecipe] = useState(false);
  
  // Recipe details modal state
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Partial<GeneratedRecipe> | null>(null);

  // Track selected options from each category
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([]);
  const [selectedProteins, setSelectedProteins] = useState<string[]>([]);
  const [selectedDietaryOptions, setSelectedDietaryOptions] = useState<string[]>([]);
  const [selectedTimeOptions, setSelectedTimeOptions] = useState<string[]>([]);

  // Rate limit notification state
  const [showRateLimitNotification, setShowRateLimitNotification] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState("");
  const [generationCount, setGenerationCount] = useState(0);

  useEffect(() => {
    // Fetch initial generation count
    fetch('/api/generations')
      .then(res => res.json())
      .then(data => setGenerationCount(data.count))
      .catch(console.error);
  }, []);

  // Control visibility of suggestion sections
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Chat container ref for scrolling
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Check if a protein is compatible with the selected dietary options
  const isProteinDisabled = (protein: string) => {
    // Check for vegan restrictions
    const isVeganSelected = selectedDietaryOptions.includes("Vegan");
    const isNonVegan = nonVeganProteins.includes(protein);

    // Check for vegetarian restrictions
    const isVegetarianSelected = selectedDietaryOptions.includes("Vegetarian");
    const isNonVegetarian = nonVegetarianProteins.includes(protein);

    return (
      (isVeganSelected && isNonVegan) || // Disable non-vegan options when vegan is selected
      (isVegetarianSelected && isNonVegetarian) // Disable non-vegetarian options when vegetarian is selected
    );
  };

  const handleSend = async () => {
    if (isLoading) return;

    // Prepare input text with selected options if input field is empty
    const userInput = inputValue.trim() || createUserInputFromSelections();

    if (!userInput) {
      toast({
        title: "No input",
        description: "Please type a message or select some options first.",
        variant: "destructive",
      });
      return;
    }

    // Add user message
    const userMessage: ChatMessage = { 
      role: "user", 
      content: userInput
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      // Send to API with all selected options
      const response = await sendChatMessage({
        messages: newMessages,
        mealType: selectedMealTypes.length > 0 ? selectedMealTypes.join(", ") : undefined,
        mainIngredient: selectedProteins.length > 0 ? selectedProteins.join(", ") : undefined,
        dietary: selectedDietaryOptions.length > 0 ? 
          selectedDietaryOptions.map(d => d.toLowerCase()).join(", ") : undefined
      });

      // Log the full response to see what we're getting from Gemini
      console.log("FULL GEMINI RESPONSE:", JSON.stringify(response, null, 2));
      
      // Add AI response to chat with recipe data if available
      const messageWithRecipe = {...response.message};
      if (response.recipe) {
        console.log("Recipe data found:", response.recipe);
        messageWithRecipe.recipe = response.recipe;
      } else {
        console.log("No recipe data found in response");
      }
      
      setMessages([...newMessages, messageWithRecipe]);
      
      // Increment generation count on server and update UI
      const genResponse = await fetch('/api/generations/increment');
      const genData = await genResponse.json();
      setGenerationCount(genData.count);

      // Hide the suggestions after getting a response
      setShowSuggestions(false);
    } catch (error: any) {
      console.error("Chat error:", error);
      console.error("Full error details:", JSON.stringify(error, null, 2));

      // Check if this is a rate limit error (status code 429)
      if (error.response?.status === 429 || 
          (typeof error === 'object' && error.message?.includes('rate limit'))) {
        // Show the rate limit notification
        setRateLimitMessage("You've reached the rate limit for AI requests. Please try again in a few minutes.");
        setShowRateLimitNotification(true);
      } 
      // Check for API key issues
      else if (typeof error === 'object' && 
              (error.message?.includes('API key') || 
               error.message?.includes('key has expired'))) {
        toast({
          title: "API Service Unavailable",
          description: "Our recipe AI service is currently unavailable. Please try again later or contact support.",
          variant: "destructive",
          duration: 6000
        });
      }
      // Check for model not found issue
      else if (typeof error === 'object' && error.message?.includes('model')) {
        toast({
          title: "AI Service Configuration Error",
          description: "There's an issue with our AI service configuration. Our team has been notified.",
          variant: "destructive",
          duration: 5000
        });
      } 
      else {
        // Show general error toast for other errors
        toast({
          title: "Error",
          description: error.message || "Failed to get a response. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Create a text input from the selected options
  const createUserInputFromSelections = () => {
    const parts: string[] = [];

    if (selectedMealTypes.length > 0) {
      parts.push(`I'm looking for a ${selectedMealTypes.join(" or ")} recipe`);
    }

    if (selectedDietaryOptions.length > 0) {
      parts.push(`that is ${selectedDietaryOptions.join(" and ")}`);
    }

    if (selectedProteins.length > 0) {
      parts.push(`with ${selectedProteins.join(" and ")}`);
    }

    if (selectedTimeOptions.length > 0) {
      parts.push(`that is ${selectedTimeOptions.join(" and ")}`);
    }

    return parts.join(" ");
  };

  const toggleChipSelection = (chipText: string, category: 'mealType' | 'protein' | 'dietary' | 'time') => {
    // Don't modify input field, just update selected state
    switch (category) {
      case 'mealType':
        setSelectedMealTypes(prev => 
          prev.includes(chipText) 
            ? prev.filter(item => item !== chipText) 
            : [...prev, chipText]
        );
        break;
      case 'protein':
        setSelectedProteins(prev => 
          prev.includes(chipText) 
            ? prev.filter(item => item !== chipText) 
            : [...prev, chipText]
        );
        break;
      case 'dietary': {
        const isVeganSelected = chipText === "Vegan" && !selectedDietaryOptions.includes("Vegan");
        const isVegetarianSelected = chipText === "Vegetarian" && !selectedDietaryOptions.includes("Vegetarian");

        setSelectedDietaryOptions(prev => {
          if (prev.includes(chipText)) {
            return prev.filter(item => item !== chipText);
          } else {
            return [...prev, chipText];
          }
        });

        // If vegan is selected, clear incompatible proteins
        if (isVeganSelected) {
          setSelectedProteins(prev => prev.filter(protein => !nonVeganProteins.includes(protein)));
        }

        // If vegetarian is selected, clear incompatible proteins
        if (isVegetarianSelected) {
          setSelectedProteins(prev => prev.filter(protein => !nonVegetarianProteins.includes(protein)));
        }
        break;
      }
      case 'time':
        setSelectedTimeOptions(prev => 
          prev.includes(chipText) 
            ? prev.filter(item => item !== chipText) 
            : [...prev, chipText]
        );
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

  const handleResetChat = () => {
    setMessages([{
      role: "assistant",
      content: "Bonjour! I am Chef Pierre, your personal CulinaryMuse assistant. What delightful recipe would you like me to 'elp you create today? Magnifique!"
    }]);
    setSelectedMealTypes([]);
    setSelectedProteins([]);
    setSelectedDietaryOptions([]);
    setSelectedTimeOptions([]);
    setShowSuggestions(true);
    setGenerationCount(0); //Reset generation count on new conversation
  };

  const handleSaveRecipe = async (recipe: any) => {
    if (!currentUser || !recipe) {
      console.log("Cannot save recipe - missing user or recipe data", { currentUser, recipe });
      return;
    }

    try {
      setIsSavingRecipe(true);
      console.log("Saving recipe:", recipe);

      // Convert the Firebase UID to a numeric ID
      const uid = currentUser.uid;
      const userId = uid ? parseInt(uid.slice(-4), 16) % 1000 || 1 : 1;
      console.log("Converted user ID for saving recipe:", userId);

      const recipeData = {
        title: recipe.title,
        description: recipe.description || "",
        ingredients: recipe.ingredients || "",
        instructions: recipe.instructions || "",
        mealType: recipe.mealType || "",
        prepTime: recipe.prepTime || 0,
        servings: recipe.servings || 0,
        userId: userId // Include the userId
      };

      const createRecipeResponse = await apiRequest('/api/recipes', {
        method: 'POST',
        body: JSON.stringify(recipeData),
      });
      
      console.log("Recipe created response:", createRecipeResponse);
      
      if (createRecipeResponse && createRecipeResponse.id) {
        // Now save this recipe to the user's saved recipes
        const saveResponse = await saveRecipe(createRecipeResponse.id, userId);
        console.log("Recipe saved to user:", saveResponse);
      }

      // Invalidate both recipe queries to refresh the sidebar
      queryClient.invalidateQueries({ queryKey: ['/api/recipes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-recipes', currentUser.uid] });

      toast({
        title: "Recipe Saved!",
        description: "The recipe has been added to your collection.",
      });
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast({
        title: "Save Failed",
        description: "Could not save the recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingRecipe(false);
    }
  };

  const handleEmailRecipe = async (recipe: any) => {
    if (!currentUser?.email || !recipe) return;

    try {
      setIsEmailingRecipe(true);

      const emailRequest: EmailRecipeRequest = {
        recipientEmail: currentUser.email,
        recipe: {
          title: recipe.title,
          description: recipe.description || "",
          ingredients: recipe.ingredients || "",
          instructions: recipe.instructions || "",
          mealType: recipe.mealType || "",
          prepTime: recipe.prepTime || 0,
          servings: recipe.servings || 0,
        }
      };

      await sendRecipeByEmail(emailRequest);

      toast({
        title: "Recipe Emailed!",
        description: `The recipe was sent to ${currentUser.email}`,
      });
    } catch (error) {
      console.error("Error emailing recipe:", error);
      toast({
        title: "Email Failed",
        description: "Could not email the recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEmailingRecipe(false);
    }
  };
  
  // Handle opening the recipe details modal
  const handleViewRecipeDetails = (recipe: Partial<GeneratedRecipe>) => {
    setSelectedRecipe(recipe);
    setIsRecipeModalOpen(true);
  };
  
  // Handle closing the recipe details modal
  const handleCloseRecipeModal = () => {
    setIsRecipeModalOpen(false);
    setSelectedRecipe(null);
  };

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      {/* Recipe details modal */}
      <RecipeDetailsModal
        recipe={selectedRecipe}
        isOpen={isRecipeModalOpen}
        onClose={handleCloseRecipeModal}
        onSave={handleSaveRecipe}
        onEmail={handleEmailRecipe}
        isSaving={isSavingRecipe}
        isEmailing={isEmailingRecipe}
        currentUserEmail={currentUser?.email}
        isAuthenticated={!!currentUser}
      />
      
      {/* Rate limit notification */}
      {showRateLimitNotification && (
        <RateLimitNotification 
          message={rateLimitMessage}
          onClose={handleCloseRateLimitNotification}
        />
      )}

      {/* Chat Interface Header */}
      <div className="bg-green-600 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <MessageSquareIcon className="h-6 w-6 mr-2" />
          <h3 className="font-medium text-lg">Chef Pierre</h3>
        </div>
        <div className="flex items-center gap-4">
          {currentUser && (
            <div className="text-sm bg-green-700 px-2 py-1 rounded">
              {isLoading ? "..." : `${generationCount}`}/10 generations
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-green-700"
            onClick={handleResetChat}
          >
            New Conversation
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        className="px-6 py-4 h-96 overflow-y-auto bg-neutral-50 custom-scrollbar"
        ref={chatContainerRef}
      >
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
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button 
                        size="sm" 
                        variant="default" 
                        className="flex items-center bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => message.recipe?.recipeData && handleSaveRecipe(message.recipe.recipeData)}
                        disabled={isSavingRecipe || !currentUser}
                      >
                        {isSavingRecipe ? (
                          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                        ) : (
                          <Save className="h-3.5 w-3.5 mr-1" />
                        )}
                        Add Recipe
                      </Button>

                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex items-center text-purple-600 border-purple-200 hover:bg-purple-50"
                        onClick={() => message.recipe?.recipeData && handleViewRecipeDetails(message.recipe.recipeData)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        View Details
                      </Button>

                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex items-center text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => message.recipe?.recipeData && handleEmailRecipe(message.recipe.recipeData)}
                        disabled={isEmailingRecipe || !currentUser?.email}
                      >
                        {isEmailingRecipe ? (
                          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                        ) : (
                          <FileDown className="h-3.5 w-3.5 mr-1" />
                        )}
                        Email recipe
                      </Button>
                    </div>
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

        {/* Show suggestions based on conversation state */}
        {showSuggestions && (
          <div className="space-y-4 mt-4">
            {/* Meal type suggestions - Always visible */}
            <div>
              <h4 className="text-sm font-medium text-neutral-500 mb-2">What meal are you looking for?</h4>
              <div className="flex flex-wrap gap-2">
                {mealTypes.map((mealType, index) => {
                  const isSelected = selectedMealTypes.includes(mealType);

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 1 }}
                      animate={{ 
                        scale: isSelected ? 1.05 : 1
                      }}
                    >
                      <SuggestionChip 
                        text={mealType}
                        variant="green"
                        isSelected={isSelected}
                        onClick={() => toggleChipSelection(mealType, 'mealType')}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Dietary suggestions - Always visible */}
            <div>
              <h4 className="text-sm font-medium text-neutral-500 mb-2">Dietary preferences</h4>
              <div className="flex flex-wrap gap-2">
                {dietarySuggestions.map((dietary, index) => {
                  const isSelected = selectedDietaryOptions.includes(dietary);

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 1 }}
                      animate={{ 
                        scale: isSelected ? 1.05 : 1
                      }}
                    >
                      <SuggestionChip 
                        text={dietary}
                        variant="purple"
                        isSelected={isSelected}
                        onClick={() => toggleChipSelection(dietary, 'dietary')}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Protein suggestions - Always visible */}
            <div>
              <h4 className="text-sm font-medium text-neutral-500 mb-2">Main protein</h4>
              <div className="flex flex-wrap gap-2">
                {proteinSuggestions.map((protein, index) => {
                  const isSelected = selectedProteins.includes(protein);
                  const isDisabled = isProteinDisabled(protein);

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 1 }}
                      animate={{ 
                        scale: isSelected ? 1.05 : 1,
                        opacity: isDisabled ? 0.4 : 1
                      }}
                    >
                      <SuggestionChip 
                        text={protein}
                        variant="blue"
                        isSelected={isSelected}
                        disabled={isDisabled}
                        onClick={() => toggleChipSelection(protein, 'protein')}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Time suggestions - Always visible */}
            <div>
              <h4 className="text-sm font-medium text-neutral-500 mb-2">Cooking time</h4>
              <div className="flex flex-wrap gap-2">
                {timeSuggestions.map((time, index) => {
                  const isSelected = selectedTimeOptions.includes(time);

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 1 }}
                      animate={{ 
                        scale: isSelected ? 1.05 : 1
                      }}
                    >
                      <SuggestionChip 
                        text={time}
                        variant="orange"
                        isSelected={isSelected}
                        onClick={() => toggleChipSelection(time, 'time')}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center my-4">
            <div className="bg-white rounded-full p-3 shadow">
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            </div>
          </div>
        )}
      </div>

      {/* Input box */}
      <div className="px-4 py-3 bg-white border-t border-neutral-200">
        <div className="flex space-x-2">
          <Input
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Send"
            )}
          </Button>
        </div>
        <div className="mt-2 text-xs text-neutral-400 text-center">
          {!showSuggestions && (
            <button 
              className="underline hover:text-neutral-600"
              onClick={() => setShowSuggestions(true)}
            >
              Show meal suggestions
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageSquareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function DotsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}