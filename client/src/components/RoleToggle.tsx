import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export function RoleToggle() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  
  if (user?.type !== "both") return null;

  const currentRole = location.includes("landlord") ? "landlord" : "tenant";
  
  const handleToggle = () => {
    if (currentRole === "landlord") {
      setLocation("/tenant");
    } else {
      setLocation("/landlord");
    }
  };

  return (
    <Button
      onClick={handleToggle}
      variant="outline"
      className="ml-4"
    >
      Switch to {currentRole === "landlord" ? "Tenant" : "Landlord"} View
    </Button>
  );
}
