import {
  Shipment,
  ShipmentDetailResponse,
  ShipmentCreatePayload,
  Draft,
  DraftCreatePayload,
  DashboardKPIs,
  AnalyticsFullResponse,
  MonthlyShipmentsData,
  MonthlySpendingData,
  UserPreferences,
  User,
  Notification,
  AIChatResponse,
  ChatMessage,
  SimulationResponse,
} from "@/types";

const rawBackendUrl =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000";
const BACKEND_URL = rawBackendUrl.replace(/\/api\/?$/, "");

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BACKEND_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (typeof window !== "undefined") {
    const sessionToken =
      localStorage.getItem("better-auth.session_token") ||
      localStorage.getItem("session_token");
    if (sessionToken) {
      headers.set("Authorization", `Bearer ${sessionToken}`);
    }
    const currentUserId = localStorage.getItem("current_user_id");
    if (currentUserId) {
      headers.set("x-user-id", currentUserId);
    }
    const currentUserEmail = localStorage.getItem("current_user_email");
    if (currentUserEmail) {
      headers.set("x-user-email", currentUserEmail);
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMsg = `API error (${response.status})`;
      let errorData;
      try {
        errorData = await response.json();
        errorMsg = errorData.detail || errorData.message || errorMsg;
      } catch {
        errorMsg = await response.text();
      }
      throw new ApiError(response.status, errorMsg, errorData);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      0,
      error.message ||
        "Network request failed. Is the FastAPI backend running?",
    );
  }
}

export const api = {
  shipments: {
    getAll: async (params?: {
      status?: string;
      search?: string;
      limit?: number;
    }): Promise<Shipment[]> => {
      const q = new URLSearchParams();
      if (params?.status) q.append("status", params.status);
      if (params?.search) q.append("search", params.search);
      if (params?.limit) q.append("limit", params.limit.toString());
      const queryStr = q.toString() ? `?${q.toString()}` : "";
      return fetchWithAuth<Shipment[]>(`/api/shipments${queryStr}`);
    },

    getById: async (id: string): Promise<ShipmentDetailResponse> => {
      return fetchWithAuth<ShipmentDetailResponse>(`/api/shipments/${id}`);
    },

    create: async (payload: ShipmentCreatePayload): Promise<Shipment> => {
      return fetchWithAuth<Shipment>("/api/shipments", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    simulateNextStatus: async (id: string): Promise<SimulationResponse> => {
      return fetchWithAuth<SimulationResponse>(
        `/api/shipments/${id}/simulate-next-status`,
        {
          method: "POST",
        },
      );
    },

    updateStatus: async (
      id: string,
      payload: { status: string; location?: string; note?: string },
    ): Promise<Shipment> => {
      return fetchWithAuth<Shipment>(`/api/shipments/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
  },

  drafts: {
    getAll: async (): Promise<Draft[]> => {
      return fetchWithAuth<Draft[]>("/api/drafts");
    },

    getById: async (id: string): Promise<Draft> => {
      return fetchWithAuth<Draft>(`/api/drafts/${id}`);
    },

    create: async (payload: DraftCreatePayload): Promise<Draft> => {
      return fetchWithAuth<Draft>("/api/drafts", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    update: async (
      id: string,
      payload: Partial<DraftCreatePayload>,
    ): Promise<Draft> => {
      return fetchWithAuth<Draft>(`/api/drafts/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },

    delete: async (
      id: string,
    ): Promise<{ success: boolean; message: string }> => {
      return fetchWithAuth<{ success: boolean; message: string }>(
        `/api/drafts/${id}`,
        {
          method: "DELETE",
        },
      );
    },
  },

  analytics: {
    getDashboardKPIs: async (): Promise<DashboardKPIs> => {
      return fetchWithAuth<DashboardKPIs>("/api/analytics/dashboard");
    },

    getFull: async (): Promise<AnalyticsFullResponse> => {
      return fetchWithAuth<AnalyticsFullResponse>("/api/analytics/full");
    },

    getMonthlyShipments: async (): Promise<MonthlyShipmentsData[]> => {
      return fetchWithAuth<MonthlyShipmentsData[]>(
        "/api/analytics/monthly-shipments",
      );
    },

    getMonthlySpending: async (): Promise<MonthlySpendingData[]> => {
      return fetchWithAuth<MonthlySpendingData[]>(
        "/api/analytics/monthly-spending",
      );
    },
  },

  preferences: {
    get: async (): Promise<UserPreferences> => {
      return fetchWithAuth<UserPreferences>("/api/preferences");
    },

    update: async (
      payload: Partial<UserPreferences>,
    ): Promise<UserPreferences> => {
      return fetchWithAuth<UserPreferences>("/api/preferences", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
  },

  profile: {
    get: async (): Promise<User> => {
      return fetchWithAuth<User>("/api/profile");
    },

    update: async (payload: {
      name?: string;
      image?: string;
    }): Promise<User> => {
      return fetchWithAuth<User>("/api/profile", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },

    uploadImage: async (file: File): Promise<User> => {
      const formData = new FormData();
      formData.append("file", file);
      return fetchWithAuth<User>("/api/profile/image", {
        method: "POST",
        body: formData,
      });
    },

    changePassword: async (
      currentPassword: string,
      newPassword: string,
    ): Promise<{ success: boolean; message: string }> => {
      return fetchWithAuth<{ success: boolean; message: string }>(
        "/api/profile/change-password",
        {
          method: "POST",
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
          }),
        },
      );
    },
  },

  notifications: {
    getAll: async (params?: {
      limit?: number;
      unread_only?: boolean;
    }): Promise<Notification[]> => {
      const q = new URLSearchParams();
      if (params?.limit) q.append("limit", params.limit.toString());
      if (params?.unread_only) q.append("unread_only", "true");
      const queryStr = q.toString() ? `?${q.toString()}` : "";
      return fetchWithAuth<Notification[]>(`/api/notifications${queryStr}`);
    },

    getUnreadCount: async (): Promise<{ unread_count: number }> => {
      return fetchWithAuth<{ unread_count: number }>(
        "/api/notifications/unread-count",
      );
    },

    markRead: async (id: string): Promise<Notification> => {
      return fetchWithAuth<Notification>(`/api/notifications/${id}/read`, {
        method: "PATCH",
      });
    },

    markAllRead: async (): Promise<{
      success: boolean;
      marked_count: number;
    }> => {
      return fetchWithAuth<{ success: boolean; marked_count: number }>(
        "/api/notifications/read-all",
        {
          method: "PATCH",
        },
      );
    },
  },

  ai: {
    chat: async (messages: ChatMessage[]): Promise<AIChatResponse> => {
      return fetchWithAuth<AIChatResponse>("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ messages }),
      });
    },

    getRecommendation: async (query: string): Promise<AIChatResponse> => {
      return fetchWithAuth<AIChatResponse>(
        `/api/ai/recommendation?query=${encodeURIComponent(query)}`,
        {
          method: "POST",
        },
      );
    },
  },
};
