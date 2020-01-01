import {Getter} from "@/common/plugins/vuex/vuex-decorators";
import {IProvider} from "@/data/Provider";
import {authModule, StoreState} from "@/store/store";
import {FirestoreObjectOptions} from "@/common/js/firestore-utils";
import FirestoreCollectionsModule, {FirestoreCollectionsModuleState} from "@/common/vuex/FirestoreCollectionsModule";

export type ProvidersModuleState = FirestoreCollectionsModuleState<IProvider>;

const providersCollection: string = "/providers";

export default class ProvidersModule extends FirestoreCollectionsModule<IProvider, ProvidersModuleState, StoreState> {

    @Getter
    get providers(): IProvider[] {
        return this.collections[providersCollection]?.list || [];
    }

    @Getter
    get sortedProviders(): IProvider[] {
        return this.providers.map(provider => provider).sort((a, b) => a.name.localeCompare(b.name));
    }

    @Getter
    get syncEnabled(): boolean {
        return this.collections[providersCollection]?.syncEnabled || false;
    }

    @Getter
    get syncing(): boolean {
        return this.collections[providersCollection]?.syncing || false;
    }

    constructor() {
        super();
        this.initVuexModule();
    }

    init() {
        this.store.watch(() => authModule.isLoggedIn, (isLoggedIn) => {
            if (!isLoggedIn) this.stopCollectionSync(providersCollection, true);
        });
    }

    syncProviders(onError?: (error: any) => void): () => void {
        return this.syncCollection(providersCollection, onError);
    }

    protected mapCollectionOptions(collectionPath: string): FirestoreObjectOptions {
        return {
            collectionPath: collectionPath,
            query(collection) {
                if (authModule.isLoggedIn && !authModule.isAdmin)
                    return collection.where("assignedAdmins", "array-contains", authModule.firebaseUser!.uid);
                return collection;
            }
        };
    }

}
