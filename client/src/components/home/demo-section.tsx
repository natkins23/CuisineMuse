import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SuggestionChip from "@/components/ui/suggestion-chip";
import { Zap, User, FileDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Chat message types
type MessageRole = "assistant" | "user";

interface ChatMessage {
  role: MessageRole;
  content: string;
  recipe?: {
    title: string;
    time: string;
    servings: string;
  };
}

// Demo meal type suggestions
const mealTypes = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack"];
const ingredientSuggestions = ["Add broccoli", "Add bell peppers", "Add zucchini", "Under 30 minutes"];

export default function DemoSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I'm your CulinaryMuse assistant. What kind of recipe would you like to create today?"
    }
  ]);
  
  const [inputValue, setInputValue] = useState("");
  
  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const newMessages = [
      ...messages,
      { role: "user", content: inputValue }
    ];
    setMessages(newMessages);
    setInputValue("");
    
    // Simulate AI response after a small delay
    setTimeout(() => {
      setMessages([
        ...newMessages,
        { 
          role: "assistant", 
          content: "Here's a quick chicken and vegetable stir-fry:",
          recipe: {
            title: "Quick Chicken & Vegetable Stir-Fry",
            time: "25 minutes",
            servings: "4 servings"
          }
        }
      ]);
    }, 1500);
  };
  
  const handleChipClick = (chipText: string) => {
    setInputValue(prev => prev ? `${prev}, ${chipText.toLowerCase()}` : chipText);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <section id="how-it-works" className="py-16 bg-green-50">
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
            <div className="px-6 py-4 h-80 overflow-y-auto bg-neutral-50">
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

              {/* Suggestion chips after first message */}
              {messages.length === 1 && (
                <div className="flex flex-wrap mb-6 space-x-2">
                  {mealTypes.map((mealType, index) => (
                    <SuggestionChip 
                      key={index}
                      text={mealType}
                      onClick={() => handleChipClick(mealType)}
                    />
                  ))}
                </div>
              )}
              
              {/* Ingredient suggestions after user message */}
              {messages.length === 2 && (
                <div className="flex flex-wrap mb-6 space-x-2">
                  {ingredientSuggestions.map((ingredient, index) => (
                    <SuggestionChip 
                      key={index}
                      text={ingredient}
                      variant="green"
                      onClick={() => handleChipClick(ingredient)}
                    />
                  ))}
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
                  className="flex-1 border border-neutral-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <Button 
                  onClick={handleSend}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-r-lg transition-colors"
                >
                  <ArrowRightIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-neutral-600 text-sm">Powered by OpenAI technology</p>
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
