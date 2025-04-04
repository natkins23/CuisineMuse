import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

export default function CTASection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: ""
    }
  });
  
  const subscription = useMutation({
    mutationFn: async (data: NewsletterFormData) => {
      // The type issue is because RequestInit expects BodyInit (string, FormData, etc)
      // but apiRequest function handles the conversion internally
      return apiRequest<any>("/api/newsletter", {
        method: "POST",
        body: data as any // Type cast to avoid TS error
      });
    },
    onSuccess: () => {
      toast({
        title: "Successfully subscribed!",
        description: "Thank you for subscribing to our newsletter.",
        variant: "default",
      });
      reset();
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error("Newsletter subscription error:", error);
      toast({
        title: "Failed to subscribe",
        description: "Please try again later.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });
  
  const onSubmit = async (data: NewsletterFormData) => {
    setIsSubmitting(true);
    subscription.mutate(data);
  };

  return (
    <section className="bg-orange-500">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl font-serif">
          <span className="block">Ready to start cooking?</span>
          <span className="block text-orange-100">Sign up for weekly recipe inspiration.</span>
        </h2>
        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div className="inline-flex rounded-md shadow">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row w-full">
              <Input
                type="email"
                placeholder="Enter your email"
                className="px-5 py-3 rounded-l-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 w-full"
                {...register("email")}
              />
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto mt-2 sm:mt-0 inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-r-md text-orange-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
