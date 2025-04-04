import Navbar from "@/components/home/navbar";
import HeroSection from "@/components/home/hero-section";
import FeatureSection from "@/components/home/feature-section";
import DemoSection from "@/components/home/demo-section-fixed";
import RecipeShowcase from "@/components/home/recipe-showcase";
import CTASection from "@/components/home/cta-section";
import AIIntegration from "@/components/home/ai-integration";
import Footer from "@/components/home/footer";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  // Fetch recipes for showcase
  const { data: recipes } = useQuery({
    queryKey: ['/api/recipes'],
    staleTime: 60000, // 1 minute
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <HeroSection />
      <FeatureSection />
      <DemoSection />
      <RecipeShowcase recipes={recipes || []} />
      <CTASection />
      <AIIntegration />
      <Footer />
    </div>
  );
}
