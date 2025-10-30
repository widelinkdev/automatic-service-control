import axios, { AxiosInstance } from 'axios';
import { Agent } from 'node:https';
import { setupCache } from 'axios-cache-interceptor';
import { encryptRSA } from './rsa.js';

export interface RSAKeyResponse {
  data:      RSAKey;
  errorcode: number;
  success:   boolean;
  timeout:   boolean;
}

export interface RSAKey {
  nn: string;
  ee: string;
}

class TpLinkHttpClient {
  private axios: AxiosInstance;
  private _tid_: string | null = null;
  private usrLvl: string | null = null;
  private pwdNeedChange: number = 0;

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
      const rsaKeys = await this.post('data/rsakey.json', {
        operation: 'read',
      });

      const encryptedPassword = encryptRSA(password, rsaKeys.data.nn, rsaKeys.data.ee);

      const response = await this.post('data/login.json', {
        operation: 'write',
        username,
        password: encryptedPassword,
      });

      if (response.errorcode === 0) {
        this._tid_ = response.data._tid_;
        this.pwdNeedChange = response.data.pwdNeedChange;
        this.usrLvl = response.data.usrLvl;
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      throw new Error(`Login error: ${(error as Error).message}`);
    }
  }

  async logout(): Promise<void> {
    try {
      const response = await this.post('data/logout.json', {
        operation: 'write',
      });

      if (response.status === 200) {
        this._tid_ = null;
        this.usrLvl = null;
        this.pwdNeedChange = 0;
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      throw new Error(`Logout error: ${(error as Error).message}`);
    }
  }

  async get(endpoint: string) {
    try {
      const response = await this.axios.get(endpoint, {
        params: {
          _tid_: this._tid_,
          usrLvl: this.usrLvl,
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`GET request error: ${(error as Error).message}`);
    }
  }

  async post(endpoint: string, data: any) {
    try {
      const response = await this.axios.post(endpoint, data, {
        params: {
          _tid_: this._tid_,
          usrLvl: this.usrLvl,
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`POST request error: ${(error as Error).message}`);
    }
  }

  async put(endpoint: string, data: any) {
    try {
      const response = await this.axios.put(endpoint, data, {
        params: {
          _tid_: this._tid_,
          usrLvl: this.usrLvl,
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`PUT request error: ${(error as Error).message}`);
    }
  }

  // Add other HTTP methods (put, delete, etc.) as needed
}

export default TpLinkHttpClient;