import { username, password, useAPI } from "../auth.json";

class AuthProvider {
    static getAuthorizationData() {
        let dataString = `${username}:${password}`;
        return `Basic ${Buffer.from(dataString).toString('base64')}`;
    }

    static isUsingApi() {
        return useAPI;
    }
}

module.exports = AuthProvider;