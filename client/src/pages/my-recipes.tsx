import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { Recipe } from "@shared/schema";
import Navbar from "@/components/home/navbar";
import ChatInterface from "@/components/recipe/chat-interface";
import RecipeSidebar from "@/components/recipe/recipe-sidebar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function MyRecipes() {
  const { currentUser, loading } = useAuth();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Redirect to home if not logged in
  useEffect(() => {
    if (!loading && !currentUser) {
      setLocation("/");
    }
  }, [currentUser, loading, setLocation]);

  // Fetch user's saved recipes
  const { data: recipes, isLoading } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes', currentUser?.uid],
    enabled: !!currentUser,
    staleTime: 60000, // 1 minute
  });

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!currentUser) {
    return null; // Will redirect to home
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Collapsible on mobile */}
        <aside 
          className={`bg-white border-r border-neutral-200 overflow-y-auto transition-all duration-300 ease-in-out
            ${sidebarOpen ? "w-80" : "w-0"} 
            md:w-80 md:static md:block md:flex-shrink-0`}
        >
          <RecipeSidebar recipes={recipes || []} isLoading={isLoading} />
        </aside>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="md:hidden mb-4">
            <Button 
              variant="outline" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full justify-between"
            >
              {sidebarOpen ? "Hide" : "Show"} Saved Recipes
            </Button>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <ChatInterface />
          </div>
        </main>
      </div>
    </div>
  );
}