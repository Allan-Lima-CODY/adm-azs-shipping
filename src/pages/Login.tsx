import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Modal from "@/components/Modal";
import { apiService } from "@/services/api";
import { Package } from "lucide-react";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email format" }),
  password: z.string().trim().min(6, { message: "Password must be at least 6 characters" }),
});

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = loginSchema.parse({ email, password });
      setIsLoading(true);

      const response = await apiService.login({
        email: validatedData.email,
        password: validatedData.password,
      });
      
      localStorage.setItem("authToken", response.token);
      
      setModal({
        isOpen: true,
        title: "Success!",
        message: "Login successful. Welcome back!",
        type: "success",
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => err.message).join(", ");
        setModal({
          isOpen: true,
          title: "Validation Error",
          message: errorMessages,
          type: "error",
        });
      } else if (error instanceof Error) {
        setModal({
          isOpen: true,
          title: "Login Failed",
          message: error.message,
          type: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-2xl shadow-lg">
              <Package className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground">AdmazsShipping</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <div className="bg-card rounded-2xl shadow-xl border border-border p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/register")}
            className="w-full h-11 border-2 hover:bg-accent/10 font-medium"
          >
            Create New Account
          </Button>
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
};

export default Login;
