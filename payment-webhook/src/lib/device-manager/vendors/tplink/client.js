import axios from 'axios';
import { Agent } from 'node:https';
import { setupCache } from 'axios-cache-interceptor';
import { encryptRSA } from './rsa.js';
class TpLinkHttpClient {
    baseUrl;
    axios;
    _tid_ = null;
    usrLvl = null;
    pwdNeedChange = 0;
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
            }
            else {
                throw new Error('Login failed');
            }
        }
        catch (error) {
            throw new Error(`Login error: ${error.message}`);
        }
    }
    async logout() {
        try {
            const response = await this.post('data/logout.json', {
                operation: 'write',
            });
            if (response.status === 200) {
                this._tid_ = null;
                this.usrLvl = null;
                this.pwdNeedChange = 0;
            }
            else {
                throw new Error('Logout failed');
            }
        }
        catch (error) {
            throw new Error(`Logout error: ${error.message}`);
        }
    }
    async get(endpoint) {
        try {
            const response = await this.axios.get(endpoint, {
                params: {
                    _tid_: this._tid_,
                    usrLvl: this.usrLvl,
                }
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
                params: {
                    _tid_: this._tid_,
                    usrLvl: this.usrLvl,
                }
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
                params: {
                    _tid_: this._tid_,
                    usrLvl: this.usrLvl,
                }
            });
            return response.data;
        }
        catch (error) {
            throw new Error(`PUT request error: ${error.message}`);
        }
    }
}
export default TpLinkHttpClient;
//# sourceMappingURL=client.js.map