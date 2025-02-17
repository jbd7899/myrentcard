import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import LandlordPage from "@/pages/landlord-page";
import TenantPage from "@/pages/tenant-page";
import LandlordFlow from "@/pages/landlord-flow";
import TenantFlow from "@/pages/tenant-flow";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/get-started" component={TenantFlow} />
        <Route path="/request-info" component={LandlordFlow} />
        <ProtectedRoute path="/landlord" component={LandlordPage} />
        <ProtectedRoute path="/tenant" component={TenantPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;