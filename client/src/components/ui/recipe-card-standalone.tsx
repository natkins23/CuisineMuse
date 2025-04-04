
import React from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent } from './card';

interface RecipeCardProps {
  title: string;
  imageUrl: string;
  cookingTime: number;
  cuisine?: string;
}

export default function RecipeCard({ title, imageUrl, cookingTime, cuisine }: RecipeCardProps) {
  return (
    <Card className="recipe-card overflow-hidden bg-white border border-neutral-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="h-48 w-full overflow-hidden">
        <img 
          className="h-full w-full object-cover transform transition-transform duration-300 hover:scale-105" 
          src={imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} 
          alt={title} 
        />
      </div>
      <CardContent className="p-4">
        {cuisine && (
          <span className="inline-block bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-2">
            {cuisine}
          </span>
        )}
        <h3 className="text-lg font-medium text-neutral-900 mb-2">{title}</h3>
        <div className="flex items-center text-sm text-neutral-500">
          <Clock className="h-4 w-4 mr-1" />
          {cookingTime} mins
        </div>
      </CardContent>
    </Card>
  );
}
