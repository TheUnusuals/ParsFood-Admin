import {Mutation, State, VuexModule} from "@/common/plugins/vuex/vuex-decorators";
import firebase from "firebase/app";
import {StoreState} from "@/store/store";
import {firebaseAuth} from "@/plugins/firebase";
import {Role} from "@/data/Role";

export type AuthModuleState = {
    user: firebase.User | null;
    token: firebase.auth.IdTokenResult | null;
};

export default class AuthModule extends VuexModule<AuthModuleState, StoreState> {

    @State firebaseUser: firebase.User | null = null;
    @State token: firebase.auth.IdTokenResult | null = null;

    get isLoggedIn(): boolean {
        return this.firebaseUser !== null && !this.firebaseUser.isAnonymous;
    }

    get role(): Role | null | undefined {
        return this.token === null ? null : this.token.claims.role;
    }

    get isAdmin(): boolean {
        return this.role === "admin";
    }

    get isProviderAdmin(): boolean {
        return this.role === "provider_admin";
    }

    get isProviderWorker(): boolean {
        return this.role === "provider_worker";
    }

    get isCustomer(): boolean {
        return this.role === "customer";
    }

    constructor() {
        super();
        this.initVuexModule();
    }

    init() {
        this.store.watch(() => this.firebaseUser, async (firebaseUser) => {
            this.setToken(firebaseUser ? await firebaseUser.getIdTokenResult() : null);
        }, {immediate: true});

        firebaseAuth.onAuthStateChanged(async (user) => {
            this.setUser(user);
        });
    }

    @Mutation
    private setToken(token: firebase.auth.IdTokenResult | null) {
        this.token = token;
    }

    @Mutation
    private setUser(user: firebase.User | null) {
        this.firebaseUser = user;
        this.token = null;
    }

}
