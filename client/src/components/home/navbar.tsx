import { useState } from "react";
import { Link } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthStatus from "@/components/auth/auth-status";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser } = useAuth();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-green-600 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </span>
              <span className="font-serif font-bold text-xl text-green-800">CulinaryMuse</span>
            </Link>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
            <a onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} href="#features" className="text-neutral-600 hover:text-green-600 px-3 py-2 text-sm font-medium transition duration-150 ease-in-out cursor-pointer">Features</a>
            <a onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }} href="#how-it-works" className="text-neutral-600 hover:text-green-600 px-3 py-2 text-sm font-medium transition duration-150 ease-in-out cursor-pointer">How It Works</a>
            <a onClick={(e) => { e.preventDefault(); document.getElementById('recipes')?.scrollIntoView({ behavior: 'smooth' }); }} href="#recipes" className="text-neutral-600 hover:text-green-600 px-3 py-2 text-sm font-medium transition duration-150 ease-in-out cursor-pointer">Recipes</a>
            {!currentUser && (
              <Button className="bg-orange-500 hover:bg-orange-600 transition-colors">
                Get Started
              </Button>
            )}
            <AuthStatus />
          </div>
          
          <div className="flex items-center sm:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="p-2 rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] sm:w-[380px]">
                <div className="mt-6 flow-root">
                  <div className="flex flex-col space-y-4 -my-2">
                    <a 
                      href="#features" 
                      className="py-2 text-base font-medium text-neutral-600 hover:text-green-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Features
                    </a>
                    <a 
                      href="#how-it-works" 
                      className="py-2 text-base font-medium text-neutral-600 hover:text-green-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      How It Works
                    </a>
                    <a 
                      href="#recipes" 
                      className="py-2 text-base font-medium text-neutral-600 hover:text-green-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Recipes
                    </a>
                    {!currentUser && (
                      <Button className="bg-orange-500 hover:bg-orange-600 transition-colors mt-4">
                        Get Started
                      </Button>
                    )}
                    <div className="mt-2">
                      <AuthStatus />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
