import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService, PropertyResponse } from "@/services/api";
import { getCustomerIdFromToken, isTokenExpired } from "@/utils/jwt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import Modal from "@/components/Modal";

const Properties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newPropertyName, setNewPropertyName] = useState("");
  const [newPropertyType, setNewPropertyType] = useState("");
  const [customerId, setCustomerId] = useState<number | null>(null);

  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "info";
    title: string;
    message: string;
    onClose: () => void;
    confirmButton?: { text: string; onClick: () => void };
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    onClose: () => {},
  });

  useEffect(() => {
    // MOCK DATA FOR PREVIEW - Remove this when backend is ready
    const PREVIEW_MODE = false;
    
    if (PREVIEW_MODE) {
      setCustomerId(1);
      setProperties([
        { id: 1, customerId: 1, name: "Fazenda Santa Maria", type: "Agricultural" },
        { id: 2, customerId: 1, name: "Apartamento Centro", type: "Residential" },
        { id: 3, customerId: 1, name: "Sítio Vale Verde", type: "Agricultural" },
        { id: 4, customerId: 1, name: "Loja Comercial", type: "Commercial" },
      ]);
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem("authToken");
      navigate("/login");
      return;
    }

    const id = getCustomerIdFromToken(token);
    if (!id) {
      navigate("/login");
      return;
    }

    setCustomerId(id);
    loadProperties(id);
  }, [navigate]);

  const loadProperties = async (id: number) => {
    try {
      setLoading(true);
      const data = await apiService.getPropertiesByCustomer(id);
      setProperties(data);
    } catch (error) {
      showModal("error", "Erro", "Falha ao carregar propriedades");
    } finally {
      setLoading(false);
    }
  };

  const showModal = (
    type: "success" | "error" | "info",
    title: string,
    message: string,
    onCloseCallback?: () => void,
    confirmButton?: { text: string; onClick: () => void }
  ) => {
    setModal({
      isOpen: true,
      type,
      title,
      message,
      confirmButton,
      onClose: () => {
        setModal((prev) => ({ ...prev, isOpen: false }));
        onCloseCallback?.();
      },
    });
  };

  const handleStartEdit = (property: PropertyResponse) => {
    if (isCreating) return;
    setEditingId(property.id);
    setEditingName(property.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleSaveEdit = async (id: number) => {
    if (!editingName.trim()) {
      showModal("error", "Erro de Validação", "O nome da propriedade é obrigatório");
      return;
    }

    try {
      await apiService.updateProperty(id, { name: editingName });
      showModal("success", "Sucesso", "Propriedade atualizada com sucesso!", () => {
        if (customerId) loadProperties(customerId);
        handleCancelEdit();
      });
    } catch (error) {
      showModal("error", "Erro", error instanceof Error ? error.message : "Falha ao atualizar propriedade");
    }
  };

  const handleDelete = (id: number) => {
    showModal(
      "info",
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir esta propriedade?",
      undefined,
      {
        text: "Confirmar",
        onClick: async () => {
          try {
            await apiService.deleteProperty(id);
            showModal("success", "Sucesso", "Propriedade excluída com sucesso!", () => {
              if (customerId) loadProperties(customerId);
            });
          } catch (error) {
            const message =
            error instanceof Error ? error.message : "Erro ao excluir propriedade";
            showModal("error", "Erro", message);
          }
        },
      }
    );
  };

  const handleStartCreate = () => {
    if (editingId) return;
    setIsCreating(true);
    setNewPropertyName("");
    setNewPropertyType("");
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewPropertyName("");
    setNewPropertyType("");
  };

  const handleSaveCreate = async () => {
    if (!newPropertyName.trim() || !newPropertyType.trim()) {
      showModal("error", "Erro de Validação", "Nome e tipo da propriedade são obrigatórios");
      return;
    }

    if (!customerId) return;

    try {
      await apiService.createProperty({
        customerId,
        name: newPropertyName,
        type: newPropertyType,
      });
      showModal("success", "Sucesso", "Propriedade criada com sucesso!", () => {
        loadProperties(customerId);
        handleCancelCreate();
      });
    } catch (error) {
      showModal("error", "Erro", error instanceof Error ? error.message : "Falha ao criar propriedade");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Propriedades</h2>
          <p className="text-muted-foreground mt-1">Gerencie suas propriedades</p>
        </div>
        <Button
          onClick={handleStartCreate}
          disabled={isCreating || editingId !== null}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Propriedade
        </Button>
      </div>

      {isCreating && (
        <div className="bg-accent/30 border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-4 text-foreground">Criar Nova Propriedade</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Nome</label>
              <Input
                value={newPropertyName}
                onChange={(e) => setNewPropertyName(e.target.value)}
                placeholder="Nome da propriedade"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Tipo</label>
              <Input
                value={newPropertyType}
                onChange={(e) => setNewPropertyType(e.target.value)}
                placeholder="Tipo da propriedade"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleSaveCreate} size="sm" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Salvar
              </Button>
              <Button
                onClick={handleCancelCreate}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Nenhuma propriedade encontrada
                </TableCell>
              </TableRow>
            ) : (
              properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell className="font-medium">{property.id}</TableCell>
                  <TableCell>
                    {editingId === property.id ? (
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="max-w-xs"
                        autoFocus
                      />
                    ) : (
                      property.name
                    )}
                  </TableCell>
                  <TableCell>{property.type}</TableCell>
                  <TableCell className="text-right">
                    {editingId === property.id ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => handleSaveEdit(property.id)}
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Save className="h-3 w-3" />
                          Salvar
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <X className="h-3 w-3" />
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => handleStartEdit(property)}
                          disabled={editingId !== null || isCreating}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Pencil className="h-3 w-3" />
                          Editar
                        </Button>
                        <Button
                          onClick={() => handleDelete(property.id)}
                          disabled={editingId !== null || isCreating}
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Excluir
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.onClose}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        confirmButton={modal.confirmButton}
      />
    </div>
  );
};

export default Properties;
