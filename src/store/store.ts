import Vue from "vue"
import Vuex, {Store} from "vuex"
import ProvidersModule, {ProvidersModuleState} from "@/store/ProvidersModule";
import VuexDecoratorsPlugin from "@/common/plugins/vuex/vuex-decorators";
import AuthModule, {AuthModuleState} from "@/store/AuthModule";
import AdditionalIngredientsGroupsModule, {AdditionalIngredientsGroupsModuleState} from "@/store/AdditionalIngredientsGroupsModule";
import RouterModule, {RouterModuleState} from "@/store/RouterModule";

Vue.use(Vuex);

export type StoreState = {
    auth: AuthModuleState;
    router: RouterModuleState;

    providers: ProvidersModuleState;
    additionalIngredientsGroups: AdditionalIngredientsGroupsModuleState;
};

export const authModule = new AuthModule();
export const routerModule = new RouterModule();

export const providersModule = new ProvidersModule();
export const additionalIngredientsGroupsModule = new AdditionalIngredientsGroupsModule();

export const store: Store<StoreState> = new Vuex.Store({
    modules: {
        auth: authModule.getModule(),
        router: routerModule.getModule(),

        providers: providersModule.getModule(),
        additionalIngredientsGroups: additionalIngredientsGroupsModule.getModule()
    },
    plugins: [VuexDecoratorsPlugin]
});
