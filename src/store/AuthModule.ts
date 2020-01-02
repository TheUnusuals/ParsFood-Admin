import {Getter, Mutation, State, VuexModule} from "@/common/plugins/vuex/vuex-decorators";
import firebase from "firebase/app";
import {StoreState} from "@/store/store";
import {firebaseAuth} from "@/plugins/firebase";
import {Role} from "@/data/Role";

export type AuthModuleState = {
    authInitialized: boolean;
    firebaseUser: firebase.User | null;
    token: firebase.auth.IdTokenResult | null;
};

export default class AuthModule extends VuexModule<AuthModuleState, StoreState> {

    @State authInitialized: boolean = false;

    @State firebaseUser: firebase.User | null = null;
    @State token: firebase.auth.IdTokenResult | null = null;

    @Getter get isLoggedIn(): boolean {
        return this.firebaseUser !== null && !this.firebaseUser.isAnonymous;
    }

    @Getter get role(): Role | null {
        return this.token === null ? null : this.token.claims.role || "customer";
    }

    @Getter get isAdmin(): boolean {
        return this.role === "admin";
    }

    @Getter get isProviderAdmin(): boolean {
        return this.role === "provider_admin";
    }

    @Getter get isProviderWorker(): boolean {
        return this.role === "provider_worker";
    }

    @Getter get isCustomer(): boolean {
        return this.role === "customer";
    }

    constructor() {
        super();
        this.initVuexModule();
    }

    async init() {
        this.store.watch(() => this.firebaseUser, async (firebaseUser) => {
            this.setToken(firebaseUser ? await firebaseUser.getIdTokenResult() : null);
        }, {immediate: true});

        firebaseAuth.onAuthStateChanged((user) => {
            this.setUser(user);
        });

        await this.initAuth();
    }

    initAuth(): Promise<void> {
        return new Promise<void>((resolve) => {
            if (this.authInitialized) {
                resolve();
                return;
            }

            const unsubscribe = firebaseAuth.onAuthStateChanged(user => {
                unsubscribe?.();
                this.setAuthInitialized(true);
                resolve();
            });

            if (this.authInitialized) unsubscribe();
        });
    }

    @Mutation
    private setAuthInitialized(authInitialized: boolean) {
        this.authInitialized = authInitialized;
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
