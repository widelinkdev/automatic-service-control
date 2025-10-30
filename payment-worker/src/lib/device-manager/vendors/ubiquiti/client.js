import axios from 'axios';
import { Agent } from 'node:https';
import { setupCache } from 'axios-cache-interceptor';
class UbiquitiHttpClient {
    baseUrl;
    axios;
    authToken = null;
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        const instance = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
            },
            httpsAgent: new Agent({
                rejectUnauthorized: false,
            }),
        });
        this.axios = setupCache(instance);
    }
    async login(username, password) {
        try {
            const response = await this.axios.post('/api/v1.0/user/login', {
                username,
                password,
            });
            if (response.status === 200 && response.data.statusCode === 200) {
                this.authToken = response.headers['x-auth-token'];
            }
            else {
                throw new Error('Login failed');
            }
        }
        catch (error) {
            throw new Error(`Login error: ${error.message}`);
        }
    }
    getAuthHeaders() {
        if (!this.authToken) {
            throw new Error('Not authenticated');
        }
        return {
            'x-auth-token': this.authToken,
        };
    }
    async get(endpoint) {
        try {
            const response = await this.axios.get(endpoint, {
                headers: this.getAuthHeaders(),
            });
            return response.data;
        }
        catch (error) {
            throw new Error(`GET request error: ${error.message}`);
        }
    }
    async post(endpoint, data) {
        try {
            const response = await this.axios.post(endpoint, data, {
                headers: this.getAuthHeaders(),
            });
            return response.data;
        }
        catch (error) {
            throw new Error(`POST request error: ${error.message}`);
        }
    }
    async put(endpoint, data) {
        try {
            const response = await this.axios.put(endpoint, data, {
                headers: this.getAuthHeaders(),
            });
            return response.data;
        }
        catch (error) {
            throw new Error(`PUT request error: ${error.message}`);
        }
    }
}
export default UbiquitiHttpClient;
//# sourceMappingURL=client.js.map