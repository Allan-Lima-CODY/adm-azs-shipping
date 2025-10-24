const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface CustomerRequest {
  name: string;
  email: string;
  password: string;
}

export interface CustomerResponse {
  id: number;
  name: string;
  email: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PropertyRequest {
  id?: number;
  customerId: number;
  name: string;
  type: string;
}

export interface PropertyResponse {
  id: number;
  customerId: number;
  name: string;
  type: string;
}

export interface PropertyUpdateRequest {
  name: string;
}

export interface FreightRequest {
  id?: number;
  name: string;
  customerId: number;
  createdAt: string;
  properties: ValuePropertyFreightRequest[];
}

export interface FreightResponse {
  id: number;
  customerId: number;
  name: string;
  createdAt: string;
  properties: ValuePropertyFreightResponse[];
}

export interface ValuePropertyFreightRequest {
  propertyId: number;
  value: string;
}

export interface ValuePropertyFreightResponse {
  id: number;
  propertyId: number;
  propertyName: string;
  type: string;
  value: string;
}

export interface ValuePropertyFreightUpdateRequest {
  propertyId: number;
  value: string;
}

export interface FreightNameUpdateRequest {
  name: string;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 400) {
        throw new Error("E-mail ou senha incorretos!");
      }
      throw new Error("Ocorreu um erro durante o login.");
    }

    return response.json();
  }

  async register(data: CustomerRequest): Promise<CustomerResponse> {
    const response = await fetch(`${API_BASE_URL}/api/customer`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();

      if (response.status === 400 && errorData.errors) {
        const validationErrors = errorData.errors as ValidationError[];
        const errorMessages = validationErrors
          .map((err) => `${err.field}: ${err.message}`)
          .join("\n");
        throw new Error(errorMessages);
      }

      throw new Error(errorData.message || "Ocorreu um erro durante o cadastro.");
    }

    return response.json();
  }

  async getCustomer(customerId: number): Promise<CustomerResponse> {
    const response = await fetch(`${API_BASE_URL}/api/customer/${customerId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Falha ao buscar os dados do cliente.");
    }

    return response.json();
  }

  async createProperty(data: PropertyRequest): Promise<PropertyResponse> {
    const response = await fetch(`${API_BASE_URL}/api/property`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();

      if (response.status === 400 && errorData.errors) {
        const validationErrors = errorData.errors as ValidationError[];
        const errorMessages = validationErrors
          .map((err) => `${err.field}: ${err.message}`)
          .join("\n");
        throw new Error(errorMessages);
      }

      throw new Error(errorData.message || "Falha ao criar propriedade.");
    }

    return response.json();
  }

  async getPropertiesByCustomer(customerId: number): Promise<PropertyResponse[]> {
    const response = await fetch(`${API_BASE_URL}/api/property/${customerId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Falha ao buscar propriedades.");
    }

    return response.json();
  }

  async updateProperty(id: number, data: PropertyUpdateRequest): Promise<PropertyResponse> {
    const response = await fetch(`${API_BASE_URL}/api/property/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();

      if (response.status === 400 && errorData.errors) {
        const validationErrors = errorData.errors as ValidationError[];
        const errorMessages = validationErrors
          .map((err) => `${err.field}: ${err.message}`)
          .join("\n");
        throw new Error(errorMessages);
      }

      throw new Error(errorData.message || "Falha ao atualizar propriedade.");
    }

    return response.json();
  }

  async deleteProperty(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/property/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao excluir propriedade." }));
      throw new Error(error.message || "Erro ao excluir propriedade.");
    }
  }

  async createFreight(data: FreightRequest): Promise<FreightResponse> {
    const response = await fetch(`${API_BASE_URL}/api/freight`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao criar frete." }));
      throw new Error(error.message || "Erro ao criar frete.");
    }

    return response.json();
  }

  async getFreightsByCustomer(customerId: number): Promise<FreightResponse[]> {
    const response = await fetch(`${API_BASE_URL}/api/freight/customer/${customerId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao buscar fretes." }));
      throw new Error(error.message || "Erro ao buscar fretes.");
    }

    return response.json();
  }

  async getFreightValues(
    freightId: number,
    search?: string,
    page: number = 0,
    size: number = 10
  ): Promise<ValuePropertyFreightResponse[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    const response = await fetch(`${API_BASE_URL}/api/freight/${freightId}/values?${params}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao buscar valores do frete." }));
      throw new Error(error.message || "Erro ao buscar valores do frete.");
    }

    return response.json();
  }

  async updateFreightValues(
    freightId: number,
    values: ValuePropertyFreightUpdateRequest[]
  ): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/freight/${freightId}/values`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao atualizar valores." }));
      throw new Error(error.message || "Erro ao atualizar valores.");
    }
  }

  async updateFreightName(freightId: number, data: FreightNameUpdateRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/freight/${freightId}/name`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao atualizar nome do frete." }));
      throw new Error(error.message || "Erro ao atualizar nome do frete.");
    }
  }

  async deleteFreightValues(freightId: number, propertyIds: number[]): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/freight/${freightId}/values`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(propertyIds),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao excluir valores." }));
      throw new Error(error.message || "Erro ao excluir valores.");
    }
  }

  async deleteFreight(freightId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/freight/${freightId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao excluir frete." }));
      throw new Error(error.message || "Erro ao excluir frete.");
    }
  }
}

export const apiService = new ApiService();
