import { AxiosInstance } from 'axios'
import { Client, UpdateClientBody } from 'types/client.js'

export default class Clients {
  constructor(private axios: AxiosInstance) {}

  async get(id?: number): Promise<Client | Client[]> {
    if (id === undefined) {
      return (await this.axios.get('clients')).data
    }

    return (await this.axios.get(`clients/${id}`)).data
  }

  async update(id: number, body: UpdateClientBody): Promise<Client> {
    try {
      const response = await this.axios.patch(`clients/${id}`, body)

      return response.data
    } catch (error) {
      throw new Error((error as Error).message)
    }
  }
}
