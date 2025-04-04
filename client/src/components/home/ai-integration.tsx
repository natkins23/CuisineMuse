import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";

export default function AIIntegration() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-base text-orange-600 font-semibold tracking-wide uppercase">AI-Powered Cooking</h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-neutral-900 sm:text-4xl font-serif">
              Cutting-Edge Recipe Creation
            </p>
            <p className="mt-4 text-lg text-neutral-600">
              CulinaryMuse harnesses the power of OpenAI's advanced language model to create personalized, detailed recipes based on your preferences, dietary restrictions, and available ingredients.
            </p>
            <div className="mt-6">
              <ul className="space-y-4">
                <li className="flex">
                  <Check className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <span className="ml-3 text-neutral-700">Natural language understanding for intuitive interactions</span>
                </li>
                <li className="flex">
                  <Check className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <span className="ml-3 text-neutral-700">Recipe customization based on specific requirements</span>
                </li>
                <li className="flex">
                  <Check className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <span className="ml-3 text-neutral-700">Continuous learning for ever-improving suggestions</span>
                </li>
                <li className="flex">
                  <Check className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <span className="ml-3 text-neutral-700">Vast knowledge of global cuisines and cooking techniques</span>
                </li>
              </ul>
            </div>
          </motion.div>
          
          <motion.div 
            className="mt-10 lg:mt-0 relative"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative h-80 lg:h-auto overflow-hidden rounded-lg shadow-xl">
              <img 
                className="w-full h-full object-cover" 
                src="https://images.unsplash.com/photo-1556911073-38141963c9e0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80" 
                alt="Chef cooking" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent opacity-60"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex space-x-2 items-center">
                  <div className="h-3 w-3 bg-orange-500 rounded-full animate-pulse"></div>
                  <div className="h-2 w-16 bg-white rounded-full"></div>
                </div>
                <p className="text-white text-lg font-medium mt-2">Analyzing ingredients...</p>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white rounded-lg shadow-lg p-4 w-3/4 lg:w-2/3">
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white">
                    <Zap className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <p className="text-neutral-700 font-medium">Powered by</p>
                  <p className="text-neutral-900 font-bold">OpenAI Technology</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
