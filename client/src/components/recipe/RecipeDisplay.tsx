import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { GeneratedRecipe, sendRecipeByEmail } from '@/lib/recipeApi';
import { Mail } from 'lucide-react';

interface RecipeDisplayProps {
  recipeData: Partial<GeneratedRecipe>;
  compact?: boolean; // Add compact mode for inline display
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipeData, compact = false }) => {
  const [email, setEmail] = useState('');
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Debug recipe data
  useEffect(() => {
    console.log("RecipeDisplay mounted with data:", recipeData);
    console.log("Is compact mode:", compact);
    
    if (!recipeData) {
      console.error("Recipe data is undefined or null");
    } else if (!recipeData.ingredients || !recipeData.instructions) {
      console.error("Recipe data missing essential components:", recipeData);
    }
  }, [recipeData, compact]);
  
  const handleSendEmail = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter an email address to send the recipe to.",
        variant: "destructive"
      });
      return;
    }
    
    setIsEmailSending(true);
    
    try {
      await sendRecipeByEmail({
        recipientEmail: email,
        recipe: recipeData
      });
      
      toast({
        title: "Email sent!",
        description: `Recipe sent successfully to ${email}`,
      });
      
      setIsDialogOpen(false);
      setEmail('');
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Failed to send email",
        description: "There was a problem sending the recipe. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsEmailSending(false);
    }
  };

  // If no recipe data, show error message
  if (!recipeData) {
    console.error("No recipe data provided to RecipeDisplay component");
    return <div className="bg-red-100 p-3 text-red-700 rounded">Recipe data not available</div>;
  }

  // Format lists from string with newlines to arrays
  const formatList = (content: string | undefined): string[] => {
    if (!content) return [];
    const result = content.split('\n').filter(item => item.trim().length > 0);
    console.log(`Formatting list from '${content}' to:`, result);
    return result;
  };

  const ingredients = formatList(recipeData.ingredients);
  const instructions = formatList(recipeData.instructions);

  // Use the compact prop value
  const isCompact = compact;

  return (
    <Card className={`w-full ${isCompact ? 'shadow-sm' : 'shadow-md'}`}>
      <CardContent className={isCompact ? "p-3" : "p-6"}>
        {!isCompact && (
          <>
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold text-green-700 mb-2">{recipeData.title}</h1>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span>Email Recipe</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Email this recipe</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleSendEmail} 
                      disabled={isEmailSending}
                    >
                      {isEmailSending ? 'Sending...' : 'Send Recipe'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="text-sm text-gray-500 mb-4">
              {recipeData.prepTime && <span>Prep time: {recipeData.prepTime} minutes • </span>}
              {recipeData.servings && <span>Servings: {recipeData.servings}</span>}
            </div>
            
            <p className="text-gray-700 mb-6">{recipeData.description}</p>
            
            <Separator className="my-4" />
          </>
        )}
        
        <div className={isCompact ? "mb-3" : "mb-6"}>
          <h2 className={`${isCompact ? 'text-lg' : 'text-xl'} font-semibold text-orange-600 ${isCompact ? 'mb-2' : 'mb-3'}`}>
            Ingredients
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            {ingredients.map((ingredient, index) => (
              <li key={index} className="text-gray-700">{ingredient}</li>
            ))}
          </ul>
        </div>
        
        <Separator className={isCompact ? "my-2" : "my-4"} />
        
        <div>
          <h2 className={`${isCompact ? 'text-lg' : 'text-xl'} font-semibold text-orange-600 ${isCompact ? 'mb-2' : 'mb-3'}`}>
            Instructions
          </h2>
          <ol className="list-decimal pl-5 space-y-2">
            {instructions.map((step, index) => (
              <li key={index} className="text-gray-700">{step}</li>
            ))}
          </ol>
        </div>
        
        {isCompact && (
          <div className="mt-4 text-right">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Email this recipe</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="compact-email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="compact-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleSendEmail} 
                    disabled={isEmailSending}
                  >
                    {isEmailSending ? 'Sending...' : 'Send Recipe'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecipeDisplay;