declare class UbiquitiHttpClient {
    private baseUrl;
    private axios;
    private authToken;
    constructor(baseUrl: string);
    login(username: string, password: string): Promise<void>;
    private getAuthHeaders;
    get(endpoint: string): Promise<any>;
    post(endpoint: string, data: any): Promise<any>;
    put(endpoint: string, data: any): Promise<any>;
}
export default UbiquitiHttpClient;
