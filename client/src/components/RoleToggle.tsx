import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { ArrowRightLeft } from "lucide-react";

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
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg flex items-center gap-2 shadow-md transition-all hover:shadow-lg"
    >
      <ArrowRightLeft className="w-5 h-5" />
      Switch to {currentRole === "landlord" ? "Tenant" : "Landlord"} View
    </Button>
  );
}