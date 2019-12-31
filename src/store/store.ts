import Vue from "vue"
import Vuex, {Store} from "vuex"
import ProvidersModule, {ProvidersModuleState} from "@/store/ProvidersModule";
import VuexDecoratorsPlugin from "@/common/plugins/vuex/vuex-decorators";
import AuthModule, {AuthModuleState} from "@/store/AuthModule";

Vue.use(Vuex);

export type StoreState = {
    auth: AuthModuleState,
    providers: ProvidersModuleState
};

export const authModule = new AuthModule();
export const providersModule = new ProvidersModule();

export const store: Store<StoreState> = new Vuex.Store({
    modules: {
        auth: authModule.getModule(),
        providers: providersModule.getModule()
    },
    plugins: [VuexDecoratorsPlugin]
});
