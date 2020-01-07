import FirestoreCollectionsModule, {FirestoreCollectionsModuleState} from "@/common/vuex/FirestoreCollectionsModule";
import {IMenuItem} from "@/data/MenuItem";
import {authModule, StoreState} from "@/store/store";
import {FirestoreObjectOptions} from "@/common/js/firestore-utils";

export type MenuItemsModuleState = FirestoreCollectionsModuleState<IMenuItem>;

export default class MenuItemsModule extends FirestoreCollectionsModule<IMenuItem, MenuItemsModuleState, StoreState> {

    constructor() {
        super();
        this.initVuexModule();
    }

    init() {
        super.init();

        this.store.watch(() => authModule.isLoggedIn, (isLoggedIn) => {
            if (!isLoggedIn) {
                for (let providerId of Object.keys(this.collections)) {
                    this.stopCollectionSync(providerId, true)
                }
            }
        });
    }

    syncMenuItems(providerId: string, onError: (error: any) => void = console.error): () => void {
        return this.syncCollection(providerId, onError);
    }

    protected mapCollectionOptions(providerId: string): FirestoreObjectOptions {
        return {
            collectionPath: `/providers/${providerId}/menu-items`
        };
    }

}
