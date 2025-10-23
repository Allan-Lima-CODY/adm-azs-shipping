import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isTokenExpired, getCustomerIdFromToken } from "@/utils/jwt";
import { apiService, CustomerResponse } from "@/services/api";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";

const Dashboard = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // MOCK DATA FOR PREVIEW - Remove this when backend is ready
    const PREVIEW_MODE = false;
    
    if (PREVIEW_MODE) {
      setCustomer({
        id: 1,
        name: "João Silva",
        email: "joao.silva@example.com"
      });
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token || isTokenExpired(token)) {
      console.log("token zuado");
      localStorage.removeItem("authToken");
      navigate("/login");
      return;
    }

    const customerId = getCustomerIdFromToken(token);
    if (!customerId) {
      console.log("CustomerID nulo");
      navigate("/login");
      return;
    }

    loadCustomer(customerId);
  }, [navigate]);

  const loadCustomer = async (customerId: number) => {
    try {
      const data = await apiService.getCustomer(customerId);
      setCustomer(data);
    } catch (error) {
      console.error("Failed to load customer:", error);
      localStorage.removeItem("authToken");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!customer) {
    console.log("Entrou aqui");
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader customerName={customer.name} />
          <main className="flex-1 bg-gradient-to-br from-primary/5 via-background to-accent/5">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
