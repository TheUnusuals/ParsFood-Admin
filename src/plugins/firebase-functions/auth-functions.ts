import {firebaseFunctions} from "@/plugins/firebase";

const auth_login = firebaseFunctions.httpsCallable("auth_login");
const auth_register = firebaseFunctions.httpsCallable("auth_register");

export default {
    async login(username: string, password: string): Promise<string> {
        return (await auth_login({username, password})).data;
    },

    async register(username: string, password: string): Promise<void> {
        await auth_register({username, password});
    }
};