export interface RSAKeyResponse {
    data: RSAKey;
    errorcode: number;
    success: boolean;
    timeout: boolean;
}
export interface RSAKey {
    nn: string;
    ee: string;
}
declare class TpLinkHttpClient {
    private baseUrl;
    private axios;
    private _tid_;
    private usrLvl;
    private pwdNeedChange;
    constructor(baseUrl: string);
    login(username: string, password: string): Promise<void>;
    logout(): Promise<void>;
    get(endpoint: string): Promise<any>;
    post(endpoint: string, data: any): Promise<any>;
    put(endpoint: string, data: any): Promise<any>;
}
export default TpLinkHttpClient;
