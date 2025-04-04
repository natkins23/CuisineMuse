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
        {/* Sidebar - Toggleable */}
        <aside 
          className={`fixed md:static bg-white border-r border-neutral-200 h-full overflow-y-auto transition-all duration-300 ease-in-out z-10
            ${sidebarOpen ? "w-80 translate-x-0" : "w-80 -translate-x-full md:translate-x-0"}`}
        >
          <div className="flex justify-between items-center p-4 border-b border-neutral-200">
            <h2 className="font-semibold">Saved Recipes</h2>
            <Button 
              variant="ghost" 
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </Button>
          </div>
          <RecipeSidebar recipes={recipes || []} isLoading={isLoading} />
        </aside>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="flex items-center mb-6">
            <Button 
              variant="outline" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-2"
            >
              {sidebarOpen ? "Hide" : "Show"} Recipes
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