import type {
  FolderCreateBody,
  FolderResponse,
  FolderUpdateBody,
  RuleCreateBody,
  RuleResponse,
  RuleUpdateBody,
} from "./api-contracts";

export class GeorulesClient {
  constructor(
    private baseUrl: string,
    private options: {
      token?: string; // For CLI (Bearer).
      useCredentials?: boolean; // For Frontend (Cookies).
    } = {},
  ) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers);

    if (this.options.token) {
      headers.set("Authorization", `Bearer ${this.options.token}`);
    }

    if (!headers.has("Content-Type") && init?.body) {
      headers.set("Content-Type", "application/json");
    }

    const config: RequestInit = {
      ...init,
      headers,
    };

    if (this.options.useCredentials) {
      config.credentials = "include";
    }

    const response = await fetch(`${this.baseUrl}${path}`, config);

    if (!response.ok) {
      // Try to parse error message.
      let errorMessage = response.statusText;
      try {
        const errorBody = await response.json();
        if (errorBody && errorBody.message) errorMessage = errorBody.message;
        if (errorBody && errorBody.error) errorMessage = errorBody.error;
      } catch {}
      throw new Error(`API Error ${response.status}: ${errorMessage}`);
    }

    // Handle 204 No Content or empty responses.
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // --- Rules ---

  async getRules() {
    return this.request<RuleResponse[]>("/api/rules/mine");
  }

  async getRule(id: RuleResponse["id"]) {
    return this.request<RuleResponse>(`/api/rules/${id}`);
  }

  async createRule(data: RuleCreateBody) {
    return this.request<RuleResponse>("/api/rules/new", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateRule(id: RuleResponse["id"], data: RuleUpdateBody) {
    return this.request<RuleResponse>(`/api/rules/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteRule(id: RuleResponse["id"]) {
    return this.request<{ success: boolean; id: string }>(`/api/rules/${id}`, {
      method: "DELETE",
    });
  }

  // --- Folders ---

  async getFolders() {
    return this.request<FolderResponse[]>("/api/folders/mine");
  }

  async getFolder(id: "ROOT" | FolderResponse["id"]) {
    return this.request<FolderResponse>(`/api/folders/${id}`);
  }

  async createFolder(data: FolderCreateBody) {
    return this.request<FolderResponse>("/api/folders/new", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateFolder(
    id: Omit<FolderResponse["id"], "ROOT">,
    data: FolderUpdateBody,
  ) {
    return this.request<FolderResponse>(`/api/folders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteFolder(id: string) {
    return this.request<{ success: boolean; id: string }>(
      `/api/folders/${id}`,
      {
        method: "DELETE",
      },
    );
  }

  // --- Sharing / Utils ---

  async getApplyCommandHash(ruleIds: string[]) {
    // TODO: Implement Apply feature.
    throw new Error("Not implemented.");
  }
}
