import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save, FileDown, Printer, ClipboardCopy } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GeneratedRecipe } from "@/lib/recipeApi";
import { useToast } from "@/hooks/use-toast";

interface RecipeDetailsModalProps {
  recipe: Partial<GeneratedRecipe> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (recipe: any) => Promise<void>;
  onEmail?: (recipe: any) => Promise<void>;
  isSaving?: boolean;
  isEmailing?: boolean;
  currentUserEmail?: string | null;
  isAuthenticated: boolean;
}

export default function RecipeDetailsModal({
  recipe,
  isOpen,
  onClose,
  onSave,
  onEmail,
  isSaving = false,
  isEmailing = false,
  currentUserEmail,
  isAuthenticated,
}: RecipeDetailsModalProps) {
  const { toast } = useToast();

  if (!recipe) return null;

  const handlePrint = () => {
    const printContents = document.getElementById("printable-recipe")?.innerHTML;
    if (!printContents) return;
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({
        title: "Print Error",
        description: "Unable to open print window. Please check your popup settings.",
        variant: "destructive",
      });
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${recipe.title || "Recipe"}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { margin-bottom: 10px; color: #333; }
            h2 { margin-top: 20px; margin-bottom: 10px; color: #444; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            p { margin-bottom: 15px; }
            ul, ol { margin-bottom: 20px; padding-left: 20px; }
            li { margin-bottom: 5px; }
            .meta { color: #666; font-size: 0.9em; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div>${printContents}</div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleCopyToClipboard = async () => {
    if (!recipe) return;
    
    try {
      const textToCopy = `
${recipe.title}

${recipe.description || ""}

Prep Time: ${recipe.prepTime} minutes
Servings: ${recipe.servings}

INGREDIENTS:
${recipe.ingredients}

INSTRUCTIONS:
${recipe.instructions}
      `.trim();
      
      await navigator.clipboard.writeText(textToCopy);
      
      toast({
        title: "Copied!",
        description: "Recipe copied to clipboard",
      });
    } catch (error) {
      console.error("Failed to copy recipe:", error);
      toast({
        title: "Copy Failed",
        description: "Could not copy the recipe to clipboard",
        variant: "destructive",
      });
    }
  };

  // Format ingredients and instructions for display
  const formatTextWithLineBreaks = (text: string | undefined) => {
    if (!text) return [];
    return text.split("\n").filter(line => line.trim() !== "");
  };

  const ingredients = formatTextWithLineBreaks(recipe.ingredients);
  const instructions = formatTextWithLineBreaks(recipe.instructions);

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">{recipe.title}</DialogTitle>
          <DialogDescription className="text-base text-neutral-600">
            {recipe.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center bg-orange-100 text-orange-800 px-2 py-1 rounded">
              <span className="font-medium">Time:</span>
              <span className="ml-1">{recipe.prepTime} mins</span>
            </span>
            <span className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded">
              <span className="font-medium">Servings:</span>
              <span className="ml-1">{recipe.servings}</span>
            </span>
            <span className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded">
              <span className="font-medium">Type:</span>
              <span className="ml-1">{recipe.mealType}</span>
            </span>
          </div>
        </div>

        <ScrollArea className="flex-1 pr-4">
          <div id="printable-recipe">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium mb-2">Ingredients</h3>
                <ul className="list-disc pl-6 space-y-1">
                  {ingredients.map((ingredient, index) => (
                    <li key={index} className="text-neutral-700">{ingredient}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-2">Instructions</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  {instructions.map((instruction, index) => (
                    <li key={index} className="text-neutral-700">{instruction}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-wrap sm:justify-between gap-2 mt-6 pt-2 border-t">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePrint}
              className="flex items-center text-neutral-600"
            >
              <Printer className="mr-1 h-4 w-4" />
              Print
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCopyToClipboard}
              className="flex items-center text-neutral-600"
            >
              <ClipboardCopy className="mr-1 h-4 w-4" />
              Copy
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {onSave && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onSave(recipe)}
                disabled={isSaving || !isAuthenticated}
                className="flex items-center text-green-600 border-green-200 hover:bg-green-50"
              >
                <Save className="mr-1 h-4 w-4" />
                {isSaving ? "Saving..." : "Save Recipe"}
              </Button>
            )}
            
            {onEmail && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEmail(recipe)}
                disabled={isEmailing || !currentUserEmail}
                className="flex items-center text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <FileDown className="mr-1 h-4 w-4" />
                {isEmailing ? "Sending..." : "Email Recipe"}
              </Button>
            )}
            
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}