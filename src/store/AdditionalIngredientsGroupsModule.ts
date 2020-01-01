import {authModule, StoreState} from "@/store/store";
import {IAdditionalIngredientGroup} from "@/data/AdditionalIngredientGroup";
import {FirestoreObjectOptions} from "@/common/js/firestore-utils";
import FirestoreCollectionsModule, {FirestoreCollectionsModuleState} from "@/common/vuex/FirestoreCollectionsModule";

export type AdditionalIngredientsGroupsModuleState = FirestoreCollectionsModuleState<IAdditionalIngredientGroup>;

export default class AdditionalIngredientsGroupsModule extends FirestoreCollectionsModule<IAdditionalIngredientGroup, AdditionalIngredientsGroupsModuleState, StoreState> {

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

    syncGroups(providerId: string, onError: (error: any) => void = console.error): () => void {
        return this.syncCollection(providerId, onError);
    }

    protected mapCollectionOptions(providerId: string): FirestoreObjectOptions {
        return {
            collectionPath: `/providers/${providerId}/additional-ingredients-groups`
        };
    }

}
