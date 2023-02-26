import Fs from 'fs';

class AuthProvider {
    static loadAuthData() {
        let authData;
        try {
            authData = JSON.parse(Fs.readFileSync("auth.json"));
        } catch (error) {
            return null;
        }
        return authData;
    }

    static getAuthorizationData() {
        let authData = this.loadAuthData();
        if (authData == null) {
            return null;
        }
        let dataString = `${authData.username}:${authData.password}`;
        return `Basic ${Buffer.from(dataString).toString('base64')}`;
    }

    static isUsingApi() {
        let authData = this.loadAuthData();
        if (authData == null) {
            return true;
        }
        return authData.useAPI;
    }

    static getApiPath() {
        let authData = this.loadAuthData();
        if (authData == null) {
            return "https://api.playmonumenta.com/items";
        }
        return `https://api.playmonumenta.com/${authData.apiPath}`;
    }
}

module.exports = AuthProvider;
