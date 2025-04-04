import Navbar from "@/components/home/navbar";
import HeroSection from "@/components/home/hero-section";
import FeatureSection from "@/components/home/feature-section";
import DemoSection from "@/components/home/demo-section-final";
import RecipeShowcase from "@/components/home/recipe-showcase";
import CTASection from "@/components/home/cta-section";
import AIIntegration from "@/components/home/ai-integration";
import Footer from "@/components/home/footer";
import ScrollToTop from "@/components/ui/scroll-to-top";
import { useQuery } from "@tanstack/react-query";
import { Recipe } from "@shared/schema";

export default function Home() {
  // Fetch recipes for showcase
  const { data: recipes, error } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes'],
    staleTime: 60000, // 1 minute
  });

  // Fallback to empty array if data isn't loaded yet or there's an error
  const recipeData = recipes || [];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <HeroSection />
      <FeatureSection />
      <CTASection />
      <DemoSection />
      <RecipeShowcase recipes={recipeData} />
      <AIIntegration />
      <Footer />
      <ScrollToTop />
    </div>
  );
}
