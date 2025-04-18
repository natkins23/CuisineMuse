import * as React from "react";
import { Recipe } from "@shared/schema";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Dialog as RemixDialog,
  DialogContent as RemixDialogContent,
  DialogHeader as RemixDialogHeader,
  DialogTitle as RemixDialogTitle,
  DialogDescription as RemixDialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle as ConfirmTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { Clock, User, X, ChefHat, Utensils, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (recipeId: string) => void;
}

export default function RecipeModal({
  recipe,
  isOpen,
  onClose,
  onDelete,
}: RecipeModalProps) {
  if (!recipe) return null;

  const [showRemixDialog, setShowRemixDialog] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  return (
    <>
      {/* Main Recipe Modal */}
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-[95vw] sm:max-w-[80vw] h-[90vh] flex flex-col px-4 sm:px-8 py-4 [&>button]:hidden">
          <DialogTitle className="sr-only">{recipe.title}</DialogTitle>
          <div className="overflow-y-auto flex-1">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 px-2 sm:px-4">
              <h2 className="text-xl sm:text-2xl font-bold text-green-700">
                {recipe.title}
              </h2>
              <div className="flex gap-2 self-start sm:self-center">
                {/* Remix Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => setShowRemixDialog(true)}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </Button>

                {/* Delete Button opens confirm dialog */}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="self-start sm:self-center"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="px-2 sm:px-4 pb-6">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                <Badge
                  variant="outline"
                  className="px-2 py-1 text-xs bg-orange-50 text-orange-700"
                >
                  {recipe.mealType}
                </Badge>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{recipe.prepTime} minutes</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>{recipe.servings} servings</span>
                </div>
                <div className="flex items-center">
                  <ChefHat className="h-4 w-4 mr-1" />
                  <span>Difficulty: Medium</span>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4 mb-6">
                <p className="text-base text-gray-700">{recipe.description}</p>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Utensils className="h-5 w-5 text-orange-600" />
                    <h3 className="text-lg font-semibold text-orange-600">
                      Ingredients
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                    {recipe.ingredients?.map((ingredient, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-gray-700 list-none"
                      >
                        <span className="h-2 w-2 rounded-full bg-orange-200" />
                        {ingredient}
                      </li>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <ChefHat className="h-5 w-5 text-orange-600" />
                    <h3 className="text-lg font-semibold text-orange-600">
                      Instructions
                    </h3>
                  </div>
                  <ol className="space-y-3">
                    {recipe.instructions?.map((instruction, index) => (
                      <li key={index} className="flex gap-3 text-gray-700">
                        <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-orange-100 text-orange-600 text-sm font-medium">
                          {index + 1}
                        </span>
                        <p className="text-sm leading-relaxed">{instruction}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remix Info Dialog */}
      <RemixDialog open={showRemixDialog} onOpenChange={setShowRemixDialog}>
        <RemixDialogContent className="max-w-sm text-center">
          <RemixDialogHeader>
            <RemixDialogTitle>Feature Coming Soon</RemixDialogTitle>
            <RemixDialogDescription>
              The ability to remix recipes will be available soon!
            </RemixDialogDescription>
          </RemixDialogHeader>
          <div className="mt-4">
            <Button
              onClick={() => setShowRemixDialog(false)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Got it
            </Button>
          </div>
        </RemixDialogContent>
      </RemixDialog>

      {/* Confirm Delete Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <ConfirmTitle>Are you sure?</ConfirmTitle>
            <AlertDialogDescription>
              This will permanently delete <b>{recipe.title}</b>. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete?.(recipe.id);
                setShowDeleteConfirm(false);
                onClose(); // Close modal after deletion
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete Recipe
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
