import { username, password, useAPI, apiPath } from "../auth.json";

class AuthProvider {
    static getAuthorizationData() {
        let dataString = `${username}:${password}`;
        return `Basic ${Buffer.from(dataString).toString('base64')}`;
    }

    static isUsingApi() {
        return useAPI;
    }

    static getApiPath() {
        return `https://api.playmonumenta.com/${apiPath}`;
    }
}

module.exports = AuthProvider;