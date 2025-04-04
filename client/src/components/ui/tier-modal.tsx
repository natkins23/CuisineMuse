
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { Recipe } from "@shared/schema";
import { useAuth } from "@/context/AuthContext";

export function TierModal() {
  const { currentUser } = useAuth();
  const { data: recipes } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes', currentUser?.uid],
    enabled: !!currentUser,
  });
  
  if (!currentUser) return null;
  
  return (
    <Dialog>
      <DialogTrigger className="text-sm text-neutral-600 hover:text-green-600 flex items-center gap-1">
        <div className="px-2 py-1 bg-neutral-100 rounded-full text-xs">
          Free Tier ({recipes?.length || 0}/3 recipes)
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">CulinaryMuse Tiers</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 mt-4">
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Free Tier</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Save up to 3 recipes
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Generate up to 10 recipes per month
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Basic recipe customization
                </li>
              </ul>
            </div>
            <div className="border rounded-lg p-4 bg-green-50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Pro Tier</h3>
                <span className="text-sm font-medium text-green-700">$4/month</span>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Unlimited recipe saves
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Unlimited recipe generation
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Advanced customization options
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Priority support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
