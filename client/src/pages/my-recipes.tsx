
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import Navbar from "@/components/home/navbar";
import ChatInterface from "@/components/recipe/chat-interface";
import RecipeSidebar from "@/components/recipe/recipe-sidebar";
import RecipeDisplay from "@/components/recipe/recipe-display";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GeneratedRecipe, sendRecipeByEmail } from "@/lib/recipeApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MyRecipes() {
  const { currentUser, loading } = useAuth();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedRecipe, setSelectedRecipe] = useState<GeneratedRecipe | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  // Redirect to home if not logged in
  useEffect(() => {
    if (!loading && !currentUser) {
      setLocation("/");
    }
  }, [currentUser, loading, setLocation]);

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
  
  const handleSendRecipe = async () => {
    if (!selectedRecipe) return;
    
    try {
      setIsSendingEmail(true);
      
      const response = await sendRecipeByEmail({
        recipientEmail: recipientEmail,
        recipe: selectedRecipe
      });
      
      toast({
        title: "Email sent",
        description: "Recipe has been sent to your email",
      });
      
      setEmailDialogOpen(false);
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: "Failed to send recipe email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Toggleable on mobile, always visible on desktop */}
        <aside 
          className={`fixed md:static bg-white border-r border-neutral-200 h-full overflow-y-auto transition-all duration-300 ease-in-out z-10 left-0 md:w-80
            ${sidebarOpen ? "w-80 translate-x-0" : "w-0 -translate-x-full md:w-80 md:translate-x-0"}`}
        >
          <RecipeSidebar 
            onSelectRecipe={(recipe) => setSelectedRecipe(recipe)}
            selectedRecipeId={selectedRecipe?.id}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Mobile sidebar toggle */}
          <div className="md:hidden mb-4">
            <Button 
              variant="outline" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center"
              size="sm"
            >
              {sidebarOpen ? "Hide" : "Show"} Recipes
              <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
            </Button>
          </div>
          
          {selectedRecipe ? (
            <RecipeDisplay 
              recipe={selectedRecipe} 
              onEmailRecipe={(recipe) => {
                setSelectedRecipe(recipe);
                setEmailDialogOpen(true);
              }}
            />
          ) : (
            <div className="max-w-3xl mx-auto">
              <ChatInterface />
            </div>
          )}
        </main>
      </div>
      
      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Recipe</DialogTitle>
            <DialogDescription>
              Send "{selectedRecipe?.title}" to your email.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleSendRecipe}
              disabled={!recipientEmail || isSendingEmail}
            >
              {isSendingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Recipe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
