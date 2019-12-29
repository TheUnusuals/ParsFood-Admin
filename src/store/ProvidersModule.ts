import {Mutation, State, VuexModule} from "@/common/plugins/vuex/vuex-decorators";
import {Provider} from "@/data/Provider";
import {StoreState} from "@/store/store";
import {FirestoreObjectOptions, subscribeToCollection, updateCollectionFromSnapshot} from "@/common/js/firestore-utils";
import {firestore} from "firebase/app";

export type ProvidersModuleState = {
    providers: Provider[];
    syncEnabled: boolean;
    syncing: boolean;
};

const providersCollectionOptions: FirestoreObjectOptions = {
    collectionPath: "/providers"
};

export default class ProvidersModule extends VuexModule<ProvidersModuleState, StoreState> {

    @State providers: Provider[] = [];
    @State syncEnabled: boolean = false;
    @State syncing: boolean = false;

    private unsubscribeFromSync?: () => void;
    private firstSync: boolean = true;
    private providersSubscribers: (() => void)[] = [];

    private unsubscribeWaitTime: number = 5000;

    constructor() {
        super();
        this.initVuexModule();
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
                providersCollectionOptions,
                (refPath: string[], snapshot: firestore.QuerySnapshot) => {
                    this.updateProvidersFromSnapshot(refPath, snapshot);
                }
            );
            this.setSyncStatus(true, true);
        }
    }

    private stopProviderSync() {
        if (this.syncEnabled) {
            if (this.unsubscribeFromSync) {
                this.unsubscribeFromSync();
                delete this.unsubscribeFromSync;
            }

            this.setSyncStatus(false, false);
        }
    }

    @Mutation
    private updateProvidersFromSnapshot(refPath: string[], snapshot: firestore.QuerySnapshot) {
        this.providers = updateCollectionFromSnapshot(
            this.firstSync ? [] : this.providers,
            providersCollectionOptions,
            refPath,
            snapshot
        );
        this.firstSync = false;
        this.syncing = false;
    }

    @Mutation
    private setSyncStatus(enabled: boolean, syncing: boolean) {
        this.syncEnabled = enabled;
        this.syncing = syncing;
    }

}
