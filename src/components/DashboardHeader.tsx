import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface DashboardHeaderProps {
  customerName: string;
}

export function DashboardHeader({ customerName }: DashboardHeaderProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-card-foreground">AdmazsShipping</h1>
              <p className="text-xs text-card-foreground/70">Olá, {customerName}</p>
            </div>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </Button>
      </div>
    </header>
  );
}
