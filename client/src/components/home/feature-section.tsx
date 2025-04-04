import { motion } from "framer-motion";
import { 
  MessageSquare, 
  Copy, 
  Hand, 
  LayoutGrid, 
  RefreshCw,
  Zap
} from "lucide-react";

const features = [
  {
    title: "Conversational Interface",
    description: "Simply chat with CulinaryMuse about what you'd like to cook, and get personalized recipes instantly.",
    icon: MessageSquare
  },
  {
    title: "Save & Organize",
    description: "Save your favorite recipes to your personal collection and organize them by categories.",
    icon: Copy
  },
  {
    title: "Smart Suggestions",
    description: "Get intelligent suggestions for meal types, ingredients, and cooking methods.",
    icon: Hand
  },
  {
    title: "Diverse Meal Types",
    description: "From breakfast to dinner, desserts to snacks – create recipes for any time of day.",
    icon: LayoutGrid
  },
  {
    title: "Customizable Recipes",
    description: "Adjust recipes based on your dietary restrictions, available ingredients, or cooking expertise.",
    icon: RefreshCw
  },
  {
    title: "Powered by AI",
    description: "Leveraging OpenAI technology to create unique, delicious, and reliable recipes.",
    icon: Zap
  }
];

export default function FeatureSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section id="features" className="py-12 bg-white sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-orange-600 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-neutral-900 sm:text-4xl font-serif">
            Smart Recipe Creation
          </p>
          <p className="mt-4 max-w-2xl text-xl text-neutral-500 lg:mx-auto">
            Everything you need to create, customize, and save your perfect recipes.
          </p>
        </div>

        <motion.div 
          className="mt-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div key={index} className="relative" variants={itemVariants}>
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-neutral-900">{feature.title}</h3>
                  <p className="mt-2 text-base text-neutral-500">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
