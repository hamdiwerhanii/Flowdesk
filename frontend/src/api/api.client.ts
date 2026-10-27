interface RequestConfig extends RequestInit {
  /** Don't try a token refresh on 401 (login, refresh, logout). */
  skipAuth?: boolean;
}

/** Rejection value of every failed request. */
export type ApiError = {
  status: number;
  message: string;
  /** Machine-readable error code, when the endpoint sends one. */
  code?: string;
};

export const isApiError = (error: unknown): error is ApiError =>
  typeof error === "object" &&
  error !== null &&
  "status" in error &&
  "message" in error;

class ApiClient {
  private baseURL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
  /** Shared by every request that hits a 401 while a refresh is running. */
  private refreshPromise: Promise<boolean> | null = null;
  private sessionExpiredHandler: (() => void) | null = null;

  /** Called once when the refresh token is rejected too. */
  onSessionExpired(handler: () => void) {
    this.sessionExpiredHandler = handler;
  }

  /** Single-flight refresh: concurrent callers await the same request. */
  refreshSession(): Promise<boolean> {
    this.refreshPromise ??= fetch(`${this.baseURL}/auth/refresh`, {
      method: "POST",
      credentials: "include"
    })
      .then(response => response.ok)
      .catch(() => false)
      .finally(() => {
        this.refreshPromise = null;
      });
    return this.refreshPromise;
  }

  private async send(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<Response> {
    const { skipAuth, ...init } = config;
    const isJson = init.body !== undefined && !(init.body instanceof FormData);
    const doFetch = () =>
      fetch(`${this.baseURL}${endpoint}`, {
        credentials: "include",
        ...init,
        headers: {
          ...(isJson ? { "Content-Type": "application/json" } : {}),
          ...init.headers
        }
      });

    let response = await doFetch();
    if (response.status === 401 && !skipAuth) {
      if (await this.refreshSession()) {
        response = await doFetch();
      } else {
        this.sessionExpiredHandler?.();
      }
    }
    return response;
  }

  private async toError(response: Response): Promise<ApiError> {
    const body = await response.json().catch(() => ({}));
    // Validation errors send a list of messages.
    const message = Array.isArray(body.message)
      ? body.message.join(". ")
      : body.message;
    return {
      status: response.status,
      message: message || "Something went wrong",
      code: body.code
    };
  }

  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const response = await this.send(endpoint, config);
    if (!response.ok) return Promise.reject(await this.toError(response));
    if (response.status === 204) return undefined as T;
    return response.json();
  }

  get<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  post<T>(endpoint: string, data?: unknown, config?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: this.toBody(data)
    });
  }

  patch<T>(endpoint: string, data?: unknown, config?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: this.toBody(data)
    });
  }

  delete<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }

  private toBody(data: unknown): BodyInit | undefined {
    if (data === undefined) return undefined;
    return data instanceof FormData ? data : JSON.stringify(data);
  }
}

export const apiClient = new ApiClient();

/** Builds `?a=1&b=2`, skipping empty values. */
export const toQueryString = (params: object): string => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
};
