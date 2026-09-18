import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';
import { AuthTokens } from '../types';

const TOKENS_KEY = 'moneymate_tokens';

class ApiService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshQueue: Array<(token: string) => void> = [];

  async loadTokens() {
    try {
      const stored = await AsyncStorage.getItem(TOKENS_KEY);
      if (stored) {
        const tokens = JSON.parse(stored);
        this.accessToken = tokens.access_token;
        this.refreshToken = tokens.refresh_token;
      }
    } catch {}
  }

  async saveTokens(tokens: { access_token: string; refresh_token: string }) {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    await AsyncStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  }

  async clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    await AsyncStorage.removeItem(TOKENS_KEY);
  }

  getAccessToken() {
    return this.accessToken;
  }

  private async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) throw new Error('No refresh token');

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: this.refreshToken }),
    });

    if (!response.ok) throw new Error('Token refresh failed');

    const data = await response.json();
    await this.saveTokens(data);
    return data.access_token;
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false,
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, { ...options, headers });

    // Handle token expiry
    if (response.status === 401 && !isRetry && this.refreshToken) {
      try {
        if (this.isRefreshing) {
          // Wait for the ongoing refresh
          const token = await new Promise<string>((resolve) => {
            this.refreshQueue.push(resolve);
          });
          headers['Authorization'] = `Bearer ${token}`;
          return this.request<T>(endpoint, { ...options, headers }, true);
        }

        this.isRefreshing = true;
        const newToken = await this.refreshAccessToken();
        this.isRefreshing = false;
        this.refreshQueue.forEach(cb => cb(newToken));
        this.refreshQueue = [];

        headers['Authorization'] = `Bearer ${newToken}`;
        return this.request<T>(endpoint, { ...options, headers }, true);
      } catch {
        this.isRefreshing = false;
        await this.clearTokens();
        throw new Error('SESSION_EXPIRED');
      }
    }

    if (!response.ok) {
      let error: any = {};
      try {
        error = await response.json();
      } catch {}
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) return {} as T;

    return response.json();
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // For file download (CSV export)
  async downloadFile(endpoint: string): Promise<Response> {
    const url = `${API_BASE_URL}${endpoint}`;
    return fetch(url, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
  }
}

export const api = new ApiService();
