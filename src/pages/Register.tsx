import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Modal from "@/components/Modal";
import { apiService } from "@/services/api";
import { Package, ArrowLeft } from "lucide-react";

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Nome deve ter no mínimo 2 caracteres" })
    .max(100, { message: "Nome deve ter no máximo 100 caracteres" }),
  email: z.string().trim().email({ message: "Formato de email inválido!" }),
  password: z.string().trim().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
});

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
    onCloseCallback?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = registerSchema.parse({ name, email, password });
      setIsLoading(true);

      await apiService.register({
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password,
      });

      setModal({
        isOpen: true,
        title: "Sucesso!",
        message: "Cliente criado com sucesso! Você pode logar com suas credenciais.",
        type: "success",
        onCloseCallback: () => {
          navigate("/login");
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => `${err.path[0]}: ${err.message}`).join("\n");
        setModal({
          isOpen: true,
          title: "Validation Error",
          message: errorMessages,
          type: "error",
        });
      } else if (error instanceof Error) {
        setModal({
          isOpen: true,
          title: "Falha No Cadastro",
          message: error.message,
          type: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModal({ ...modal, isOpen: false });
    if (modal.onCloseCallback) {
      modal.onCloseCallback();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-accent rounded-2xl shadow-lg">
              <Package className="h-10 w-10 text-accent-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground">Criar Conta</h1>
          <p className="text-muted-foreground">Entre para a Shipping hoje</p>
        </div>

        <div className="bg-card rounded-2xl shadow-xl border border-border p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seuemail@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Senha deve ter no mínimo 6 caracteres
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
            >
              {isLoading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Já tem uma conta?
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/login")}
            className="w-full h-11 border-2 hover:bg-primary/10 font-medium"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Login
          </Button>
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={handleCloseModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
};

export default Register;
