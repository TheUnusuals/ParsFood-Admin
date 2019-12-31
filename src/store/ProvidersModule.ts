import {Getter, Mutation, State, VuexModule} from "@/common/plugins/vuex/vuex-decorators";
import {Provider} from "@/data/Provider";
import {authModule, StoreState} from "@/store/store";
import {FirestoreObjectOptions, subscribeToCollection, updateCollectionFromSnapshot} from "@/common/js/firestore-utils";
import {firestore} from "firebase/app";

export type ProvidersModuleState = {
    providers: Provider[];
    syncEnabled: boolean;
    syncing: boolean;

    providersCollectionOptions: FirestoreObjectOptions;
};

export default class ProvidersModule extends VuexModule<ProvidersModuleState, StoreState> {

    @State providers: Provider[] = [];
    @State syncEnabled: boolean = false;
    @State syncing: boolean = false;

    @Getter
    get providersCollectionOptions(): FirestoreObjectOptions {
        return {
            collectionPath: "/providers",
            query(collection) {
                if (authModule.isLoggedIn && !authModule.isAdmin)
                    return collection.where("assignedAdmins", "array-contains", authModule.firebaseUser!.uid);
                return collection;
            }
        }
    }

    private unsubscribeFromSync?: () => void;
    private firstSync: boolean = true;
    private providersSubscribers: (() => void)[] = [];

    private unsubscribeWaitTime: number = 5000;

    constructor() {
        super();
        this.initVuexModule();
    }

    init() {
        this.store.watch(() => authModule.isLoggedIn, (isLoggedIn) => {
            if (!isLoggedIn) this.stopProviderSync(true);
        });

        this.store.watch(() => this.providersCollectionOptions, () => {
            if (this.syncEnabled) {
                this.stopProviderSync();
                this.startProviderSync();
            }
        });
    }

    syncProviders(): () => void {
        if (!this.syncEnabled || this.providersSubscribers.length === 0)
            this.startProviderSync();

        const unsubscribe = () => {
            setTimeout(() => {
                let index = this.providersSubscribers.indexOf(unsubscribe);
                if (index !== -1) this.providersSubscribers.splice(index, 1);
                if (this.providersSubscribers.length === 0) this.stopProviderSync();
            }, this.unsubscribeWaitTime);
        };

        this.providersSubscribers.push(unsubscribe);

        return unsubscribe;
    }

    private startProviderSync() {
        if (!this.syncEnabled) {
            this.firstSync = true;
            this.unsubscribeFromSync = subscribeToCollection(
                this.providersCollectionOptions,
                (refPath: string[], snapshot: firestore.QuerySnapshot) => {
                    this.updateProvidersFromSnapshot(refPath, snapshot);
                }
            );
            this.setSyncStatus(true, true);
        }
    }

    private stopProviderSync(resetProviders: boolean = false) {
        if (this.syncEnabled) {
            if (this.unsubscribeFromSync) {
                this.unsubscribeFromSync();
                delete this.unsubscribeFromSync;
            }

            this.setSyncStatus(false, false, resetProviders);
        }
    }

    @Mutation
    private updateProvidersFromSnapshot(refPath: string[], snapshot: firestore.QuerySnapshot) {
        this.providers = updateCollectionFromSnapshot(
            this.firstSync ? [] : this.providers,
            this.providersCollectionOptions,
            refPath,
            snapshot
        );
        this.firstSync = false;
        this.syncing = false;
    }

    @Mutation
    private setSyncStatus(enabled: boolean, syncing: boolean, resetProviders: boolean = false) {
        this.syncEnabled = enabled;
        this.syncing = syncing;

        if (resetProviders) this.providers = [];
    }

}
