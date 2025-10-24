import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isTokenExpired, getCustomerIdFromToken } from "@/utils/jwt";
import { apiService, PropertyResponse, FreightResponse, ValuePropertyFreightResponse } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Eye, Pencil, Save, X } from "lucide-react";
import Modal from "@/components/Modal";
import { format } from "date-fns";

const PREVIEW_MODE = false;

type ViewMode = "list" | "view" | "edit";

const Freight = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [freights, setFreights] = useState<FreightResponse[]>([]);
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [mode, setMode] = useState<ViewMode>("list");
  const [selectedFreight, setSelectedFreight] = useState<FreightResponse | null>(null);
  const [freightValues, setFreightValues] = useState<ValuePropertyFreightResponse[]>([]);
  
  // Create freight states
  const [isCreating, setIsCreating] = useState(false);
  const [newFreightName, setNewFreightName] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [propertyValue, setPropertyValue] = useState("");
  const [addedProperties, setAddedProperties] = useState<Array<{ propertyId: number; propertyName: string; propertyType: string; value: string }>>([]);
  
  // Edit freight name states
  const [isEditingName, setIsEditingName] = useState(false);
  const [editFreightName, setEditFreightName] = useState("");
  
  // Edit value states
  const [editingValueId, setEditingValueId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  
  // Pagination and search
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSearch, setCurrentSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [hasNextPage, setHasNextPage] = useState(false);
  
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: "success" | "error" | "info";
    confirmButton?: {
      text: string;
      onClick: () => void;
    };
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  // Mock data for preview
  const mockFreights: FreightResponse[] = [
    {
      id: 1,
      customerId: 1,
      name: "Frete Nacional",
      createdAt: "2025-01-15T10:30:00",
      properties: []
    },
    {
      id: 2,
      customerId: 1,
      name: "Frete Internacional",
      createdAt: "2025-01-20T14:45:00",
      properties: []
    },
  ];

  const mockProperties: PropertyResponse[] = [
    { id: 1, customerId: 1, name: "Peso", type: "Numérico" },
    { id: 2, customerId: 1, name: "Destino", type: "Texto" },
    { id: 3, customerId: 1, name: "Data Entrega", type: "Data" },
  ];

  const mockValues: ValuePropertyFreightResponse[] = [
    { id: 1, propertyId: 1, propertyName: "Peso", type: "Numérico", value: "150kg" },
    { id: 2, propertyId: 2, propertyName: "Destino", type: "Texto", value: "São Paulo" },
    { id: 3, propertyId: 3, propertyName: "Data Entrega", type: "Data", value: "2025-02-01" },
  ];

  const loadFreights = async () => {
    if (PREVIEW_MODE) {
      setFreights(mockFreights);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const customerId = getCustomerIdFromToken(token);
      const data = await apiService.getFreightsByCustomer(customerId);
      setFreights(data);
    } catch (error: any) {
      setModal({
        isOpen: true,
        title: "Erro",
        message: error.message || "Erro ao carregar fretes",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    if (PREVIEW_MODE) {
      setProperties(mockProperties);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const customerId = getCustomerIdFromToken(token);
      const data = await apiService.getPropertiesByCustomer(customerId);
      setProperties(data);
    } catch (error: any) {
      setModal({
        isOpen: true,
        title: "Erro",
        message: error.message || "Erro ao carregar propriedades",
        type: "error",
      });
    }
  };

  const loadFreightValues = async (freightId: number, search?: string, page: number = 0, size: number = 10) => {
    if (PREVIEW_MODE) {
      setFreightValues(mockValues);
      setHasNextPage(false);
      return;
    }

    try {
      const data = await apiService.getFreightValues(freightId, search, page, size);
      setFreightValues(data);
      // Se retornou menos itens que o tamanho da página, não há próxima página
      setHasNextPage(data.length === size);
    } catch (error: any) {
      setModal({
        isOpen: true,
        title: "Erro",
        message: error.message || "Erro ao carregar valores do frete",
        type: "error",
      });
      setFreightValues([]);
      setHasNextPage(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token || isTokenExpired(token)) {
      navigate("/login");
      return;
    }

    loadFreights();
    loadProperties();
  }, [navigate]);

  const handleAddProperty = () => {
    if (!selectedPropertyId || !propertyValue.trim()) {
      setModal({
        isOpen: true,
        title: "Erro",
        message: "Selecione uma propriedade e preencha o valor",
        type: "error",
      });
      return;
    }

    const propertyIdNum = parseInt(selectedPropertyId);
    
    // Check if property already added
    if (addedProperties.some(p => p.propertyId === propertyIdNum)) {
      setModal({
        isOpen: true,
        title: "Erro",
        message: "Esta propriedade já foi adicionada",
        type: "error",
      });
      return;
    }

    const property = properties.find(p => p.id === propertyIdNum);
    if (!property) return;

    setAddedProperties([
      ...addedProperties,
      {
        propertyId: propertyIdNum,
        propertyName: property.name,
        propertyType: property.type,
        value: propertyValue,
      },
    ]);

    setSelectedPropertyId("");
    setPropertyValue("");
  };

  const handleRemoveProperty = (propertyId: number) => {
    setAddedProperties(addedProperties.filter(p => p.propertyId !== propertyId));
  };

  const handleSaveFreight = async () => {
    if (!newFreightName.trim()) {
      setModal({
        isOpen: true,
        title: "Erro",
        message: "O nome do frete é obrigatório",
        type: "error",
      });
      return;
    }

    if (addedProperties.length === 0) {
      setModal({
        isOpen: true,
        title: "Erro",
        message: "Adicione pelo menos uma propriedade ao frete",
        type: "error",
      });
      return;
    }

    if (PREVIEW_MODE) {
      setModal({
        isOpen: true,
        title: "Sucesso",
        message: "Frete criado com sucesso!",
        type: "success",
      });
      setIsCreating(false);
      setNewFreightName("");
      setAddedProperties([]);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const customerId = getCustomerIdFromToken(token);
      
      await apiService.createFreight({
        name: newFreightName,
        customerId,
        createdAt: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 19),
        properties: addedProperties.map(p => ({propertyId: p.propertyId, value: p.value})),
      });

      setModal({
        isOpen: true,
        title: "Sucesso",
        message: "Frete criado com sucesso!",
        type: "success",
      });
      
      setIsCreating(false);
      setNewFreightName("");
      setAddedProperties([]);
      await loadFreights();
    } catch (error: any) {
      setModal({
        isOpen: true,
        title: "Erro",
        message: error.message || "Erro ao criar frete",
        type: "error",
      });
    }
  };

  const handleDeleteFreight = async (freightId: number) => {
    if (PREVIEW_MODE) {
      setModal({
        isOpen: true,
        title: "Sucesso",
        message: "Frete excluído com sucesso!",
        type: "success",
      });
      return;
    }

    try {
      await apiService.deleteFreight(freightId);
      setModal({
        isOpen: true,
        title: "Sucesso",
        message: "Frete excluído com sucesso!",
        type: "success",
      });
      await loadFreights();
    } catch (error: any) {
      setModal({
        isOpen: true,
        title: "Erro",
        message: error.message || "Erro ao excluir frete",
        type: "error",
      });
    }
  };

  const handleViewFreight = (freight: FreightResponse) => {
    setSelectedFreight(freight);
    setMode("view");
    setCurrentPage(0);
    setCurrentSearch("");
    setSearchTerm("");
    loadFreightValues(freight.id, undefined, 0, pageSize);
  };

  const handleEditFreight = (freight: FreightResponse) => {
    setSelectedFreight(freight);
    setMode("edit");
    setEditFreightName(freight.name);
    setCurrentPage(0);
    setCurrentSearch("");
    setSearchTerm("");
    loadFreightValues(freight.id, undefined, 0, pageSize);
  };

  const handleBackToList = () => {
    setMode("list");
    setSelectedFreight(null);
    setIsEditingName(false);
    setEditingValueId(null);
  };

  const handleSearch = () => {
    if (!selectedFreight) return;
    setCurrentSearch(searchTerm);
    setCurrentPage(0);
    loadFreightValues(selectedFreight.id, searchTerm, 0, pageSize);
  };

  const handlePageChange = (page: number) => {
    if (!selectedFreight || page < 0) return;
    setCurrentPage(page);
    loadFreightValues(selectedFreight.id, currentSearch, page, pageSize);
  };

  const handlePageSizeChange = (size: string) => {
    if (!selectedFreight) return;
    const newSize = parseInt(size);
    setPageSize(newSize);
    setCurrentPage(0);
    loadFreightValues(selectedFreight.id, currentSearch, 0, newSize);
  };

  const handleEditValue = (value: ValuePropertyFreightResponse) => {
    setEditingValueId(value.id);
    setEditValue(value.value);
  };

  const handleSaveEditValue = async (valueId: number, propertyId: number) => {
    if (!editValue.trim()) {
      setModal({
        isOpen: true,
        title: "Erro",
        message: "O valor não pode estar vazio",
        type: "error",
      });
      return;
    }

    if (PREVIEW_MODE) {
      setModal({
        isOpen: true,
        title: "Sucesso",
        message: "Valor atualizado com sucesso!",
        type: "success",
      });
      setEditingValueId(null);
      setEditValue("");
      return;
    }

    try {
      if (!selectedFreight) return;

      await apiService.updateFreightValues(selectedFreight.id, [
        { propertyId, value: editValue },
      ]);

      setModal({
        isOpen: true,
        title: "Sucesso",
        message: "Valor atualizado com sucesso!",
        type: "success",
      });
      
      setEditingValueId(null);
      setEditValue("");
      await loadFreightValues(selectedFreight.id, currentSearch, currentPage, pageSize);
    } catch (error: any) {
      setModal({
        isOpen: true,
        title: "Erro",
        message: error.message || "Erro ao atualizar valor",
        type: "error",
      });
    }
  };

  const handleDeleteValue = async (propertyId: number) => {
    if (PREVIEW_MODE) {
      setModal({
        isOpen: true,
        title: "Sucesso",
        message: "Propriedade desvinculada com sucesso!",
        type: "success",
      });
      return;
    }

    try {
      if (!selectedFreight) return;

      await apiService.deleteFreightValues(selectedFreight.id, [propertyId]);
      
      setModal({
        isOpen: true,
        title: "Sucesso",
        message: "Propriedade desvinculada com sucesso!",
        type: "success",
      });
      
      await loadFreightValues(selectedFreight.id, currentSearch, currentPage, pageSize);
    } catch (error: any) {
      setModal({
        isOpen: true,
        title: "Erro",
        message: error.message || "Erro ao desvincular propriedade",
        type: "error",
      });
    }
  };

  const handleSaveFreightName = async () => {
    if (!editFreightName.trim()) {
      setModal({
        isOpen: true,
        title: "Erro",
        message: "O nome do frete não pode estar vazio",
        type: "error",
      });
      return;
    }

    if (PREVIEW_MODE) {
      setModal({
        isOpen: true,
        title: "Sucesso",
        message: "Nome do frete atualizado com sucesso!",
        type: "success",
      });
      setIsEditingName(false);
      if (selectedFreight) {
        setSelectedFreight({ ...selectedFreight, name: editFreightName });
      }
      return;
    }

    try {
      if (!selectedFreight) return;

      await apiService.updateFreightName(selectedFreight.id, { name: editFreightName });
      
      setModal({
        isOpen: true,
        title: "Sucesso",
        message: "Nome do frete atualizado com sucesso!",
        type: "success",
      });
      
      setIsEditingName(false);
      setSelectedFreight({ ...selectedFreight, name: editFreightName });
      await loadFreights();
    } catch (error: any) {
      setModal({
        isOpen: true,
        title: "Erro",
        message: error.message || "Erro ao atualizar nome do frete",
        type: "error",
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (mode === "view" || mode === "edit") {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button onClick={handleBackToList} variant="outline" size="sm">
              ← Voltar
            </Button>
          </div>
        </div>

        {mode === "edit" && (
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Nome do Frete
                </label>
                {isEditingName ? (
                  <Input
                    value={editFreightName}
                    onChange={(e) => setEditFreightName(e.target.value)}
                    placeholder="Nome do frete"
                  />
                ) : (
                  <p className="text-lg font-semibold text-foreground">
                    {selectedFreight?.name}
                  </p>
                )}
              </div>
              {isEditingName ? (
                <div className="flex items-end gap-2">
                  <Button onClick={handleSaveFreightName} size="sm">
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditingName(false);
                      setEditFreightName(selectedFreight?.name || "");
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsEditingName(true)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
              )}
            </div>
          </div>
        )}

        {mode === "view" && (
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-xl font-bold text-foreground">{selectedFreight?.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Criado em: {selectedFreight?.createdAt ? formatDate(selectedFreight.createdAt) : ""}
            </p>
          </div>
        )}

        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>Buscar</Button>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 por página</SelectItem>
                <SelectItem value="10">10 por página</SelectItem>
                <SelectItem value="20">20 por página</SelectItem>
                <SelectItem value="50">50 por página</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome da Propriedade</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  {mode === "edit" && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {freightValues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={mode === "edit" ? 5 : 4} className="text-center text-muted-foreground">
                      Nenhum valor encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  freightValues.map((value) => (
                    <TableRow key={value.id}>
                      <TableCell>{value.id}</TableCell>
                      <TableCell>{value.propertyName}</TableCell>
                      <TableCell>{value.type}</TableCell>
                      <TableCell>
                        {editingValueId === value.id ? (
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="max-w-xs"
                          />
                        ) : (
                          value.value
                        )}
                      </TableCell>
                      {mode === "edit" && (
                        <TableCell className="text-right">
                          {editingValueId === value.id ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                onClick={() => handleSaveEditValue(value.id, value.propertyId)}
                                size="sm"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => {
                                  setEditingValueId(null);
                                  setEditValue("");
                                }}
                                variant="outline"
                                size="sm"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <Button
                                onClick={() => handleEditValue(value)}
                                variant="outline"
                                size="sm"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() =>
                                  setModal({
                                    isOpen: true,
                                    title: "Confirmar Exclusão",
                                    message: "Deseja realmente desvincular esta propriedade?",
                                    type: "info",
                                    confirmButton: {
                                      text: "Excluir",
                                      onClick: () => handleDeleteValue(value.propertyId),
                                    },
                                  })
                                }
                                variant="destructive"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                variant="outline"
                size="sm"
              >
                ← Anterior
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                Página {currentPage + 1}
              </span>
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNextPage}
                variant="outline"
                size="sm"
              >
                Próxima →
              </Button>
            </div>
          </div>
        </div>

        <Modal
          isOpen={modal.isOpen}
          onClose={() => setModal({ ...modal, isOpen: false })}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          confirmButton={modal.confirmButton}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Frete</h2>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Criar Frete
          </Button>
        )}
      </div>

      {isCreating && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Novo Frete</h3>
          
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Nome do Frete
            </label>
            <Input
              value={newFreightName}
              onChange={(e) => setNewFreightName(e.target.value)}
              placeholder="Nome do frete"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Propriedade
              </label>
              <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma propriedade" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((prop) => (
                    <SelectItem key={prop.id} value={prop.id.toString()}>
                      {prop.name} - {prop.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Valor
              </label>
              <Input
                value={propertyValue}
                onChange={(e) => setPropertyValue(e.target.value)}
                placeholder="Valor da propriedade"
              />
            </div>
          </div>

          <Button onClick={handleAddProperty} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Propriedade
          </Button>

          {addedProperties.length > 0 && (
            <div className="border border-border rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Propriedades Adicionadas:</h4>
              {addedProperties.map((prop) => (
                <div
                  key={prop.propertyId}
                  className="flex items-center justify-between bg-muted/50 p-3 rounded-md"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {prop.propertyName} - {prop.propertyType}
                    </p>
                    <p className="text-sm text-muted-foreground">Valor: {prop.value}</p>
                  </div>
                  <Button
                    onClick={() => handleRemoveProperty(prop.propertyId)}
                    variant="ghost"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleSaveFreight} className="flex-1">
              Salvar Frete
            </Button>
            <Button
              onClick={() => {
                setIsCreating(false);
                setNewFreightName("");
                setAddedProperties([]);
                setSelectedPropertyId("");
                setPropertyValue("");
              }}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {freights.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Nenhum frete cadastrado
                </TableCell>
              </TableRow>
            ) : (
              freights.map((freight) => (
                <TableRow key={freight.id}>
                  <TableCell>{freight.id}</TableCell>
                  <TableCell>{freight.name}</TableCell>
                  <TableCell>{formatDate(freight.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={() => handleViewFreight(freight)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleEditFreight(freight)}
                        variant="outline"
                        size="sm"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() =>
                          setModal({
                            isOpen: true,
                            title: "Confirmar Exclusão",
                            message: "Deseja realmente excluir este frete?",
                            type: "info",
                            confirmButton: {
                              text: "Excluir",
                              onClick: () => handleDeleteFreight(freight.id),
                            },
                          })
                        }
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        confirmButton={modal.confirmButton}
      />
    </div>
  );
};

export default Freight;