import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { FrenchAccentProvider } from "@/context/FrenchAccentContext"; // Added import

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FrenchAccentProvider> {/* Added FrenchAccentProvider */}
          <Router />
          <Toaster />
        </FrenchAccentProvider> {/* Closed FrenchAccentProvider */}
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;