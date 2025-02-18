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
import SamplePrescreening from "@/pages/sample-prescreening";
import QRCodePage from "@/pages/qr-code";
import EditScreeningPage from "@/pages/edit-screening";
import AnalyticsPage from "@/pages/analytics";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/get-started" component={TenantFlow} />
        <Route path="/request-info" component={LandlordFlow} />
        <Route path="/sample-prescreening" component={SamplePrescreening} />
        <Route path="/apply/:id" component={SamplePrescreening} />
        <ProtectedRoute path="/landlord" component={LandlordPage} />
        <ProtectedRoute path="/tenant" component={TenantPage} />
        <ProtectedRoute path="/qr-code/general" component={QRCodePage} />
        <ProtectedRoute path="/qr-code/property-:id" component={QRCodePage} />
        <ProtectedRoute path="/edit-screening/general" component={EditScreeningPage} />
        <ProtectedRoute path="/edit-screening/property/:id" component={EditScreeningPage} />
        <ProtectedRoute path="/analytics/general" component={AnalyticsPage} />
        <ProtectedRoute path="/analytics/property/:id" component={AnalyticsPage} />
        <Route path="/screening/:urlId" component={SamplePrescreening} />
        <ProtectedRoute path="/qr-code/:urlId" component={QRCodePage} />
        <ProtectedRoute path="/edit-screening/:urlId" component={EditScreeningPage} />
        <ProtectedRoute path="/analytics/:urlId" component={AnalyticsPage} />
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