import Vue from "vue"
import Vuex, {Store} from "vuex"
import ProvidersModule, {ProvidersModuleState} from "@/store/ProvidersModule";
import VuexDecoratorsPlugin from "@/common/plugins/vuex/vuex-decorators";

Vue.use(Vuex);

export type StoreState = {
    providers: ProvidersModuleState
};

export const providersModule = new ProvidersModule();

export const store: Store<StoreState> = new Vuex.Store({
    modules: {
        providers: providersModule.getModule()
    },
    plugins: [VuexDecoratorsPlugin]
});
