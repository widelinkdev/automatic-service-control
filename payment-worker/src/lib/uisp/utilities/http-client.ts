import axios, { AxiosInstance } from "axios"

export interface BaseHttpClient {
  get<T = any>(url: string, params?: Record<string, any>): Promise<T>
  post<T = any>(url: string, body?: any, config?: Record<string, any>): Promise<T>
  put<T = any>(url: string, body?: any, config?: Record<string, any>): Promise<T>
  patch?<T = any>(url: string, body?: any, config?: Record<string, any>): Promise<T>
  delete<T = any>(url: string, config?: Record<string, any>): Promise<T>
}

export function createHttpClient(baseURL: string, options: Record<string, any> = {}): BaseHttpClient {
  const instance: AxiosInstance = axios.create({
    baseURL,
    ...options,
  })

  return {
    get: (url, params) => instance.get(url, { params }).then(res => res.data),
    post: (url, body, config) => instance.post(url, body, config).then(res => res.data),
    put: (url, body, config) => instance.put(url, body, config).then(res => res.data),
    patch: (url, body, config) => instance.patch(url, body, config).then(res => res.data),
    delete: (url, config) => instance.delete(url, config).then(res => res.data),
  }
}

export class HttpClient implements BaseHttpClient {
  private client: AxiosInstance

  constructor(baseURL: string, opts?: Record<string, any>) {
    this.client = axios.create({
      baseURL,
      ...opts,
    })
  }

  get<T = any>(url: string, config?: Record<string, any>) {
    return this.client.get<T>(url, config).then(res => res.data)
  }

  post<T = any>(url: string, data?: any, config?: Record<string, any>) {
    return this.client.post<T>(url, data, config).then(res => res.data)
  }

  put<T = any>(url: string, data?: any, config?: Record<string, any>) {
    return this.client.put<T>(url, data, config).then(res => res.data)
  }

  patch<T = any>(url: string, data?: any, config?: Record<string, any>) {
    return this.client.patch<T>(url, data, config).then(res => res.data)
  }

  delete<T = any>(url: string, config?: Record<string, any>) {
    return this.client.delete<T>(url, config).then(res => res.data)
  }
}
