import {Mutation, State, VuexModule} from "@/common/plugins/vuex/vuex-decorators";
import {StoreState} from "@/store/store";

export type RouterModuleState = {};

export default class RouterModule extends VuexModule<RouterModuleState, StoreState> {

    @State routerInitialized: boolean = false;

    constructor() {
        super();
        this.initVuexModule();
    }

    @Mutation
    initializeRouter() {
        this.routerInitialized = true;
    }

}
