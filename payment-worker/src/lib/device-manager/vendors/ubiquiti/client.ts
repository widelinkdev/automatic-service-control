import axios, { AxiosInstance } from 'axios';
import { Agent } from 'node:https';
import { setupCache } from 'axios-cache-interceptor';

class UbiquitiHttpClient {
  private axios: AxiosInstance;
  private authToken: string | null = null;

  constructor(private baseUrl: string) {
    const instance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      httpsAgent: new Agent({
        rejectUnauthorized: false,
      }),
    });

    this.axios = (setupCache(instance) as unknown) as AxiosInstance;
  }

  async login(username: string, password: string): Promise<void> {
    try {
      const response = await this.axios.post('/api/v1.0/user/login', {
        username,
        password,
      });

      if (response.status === 200 && response.data.statusCode === 200) {
        this.authToken = response.headers['x-auth-token'];
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      throw new Error(`Login error: ${(error as Error).message}`);
    }
  }

  private getAuthHeaders() {
    if (!this.authToken) {
      throw new Error('Not authenticated');
    }
    return {
      'x-auth-token': this.authToken,
    };
  }

  async get(endpoint: string) {
    try {
      const response = await this.axios.get(endpoint, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      throw new Error(`GET request error: ${(error as Error).message}`);
    }
  }

  async post(endpoint: string, data: any) {
    try {
      const response = await this.axios.post(endpoint, data, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      throw new Error(`POST request error: ${(error as Error).message}`);
    }
  }

  async put(endpoint: string, data: any) {
    try {
      const response = await this.axios.put(endpoint, data, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      throw new Error(`PUT request error: ${(error as Error).message}`);
    }
  }

  // Add other HTTP methods (put, delete, etc.) as needed
}

export default UbiquitiHttpClient;