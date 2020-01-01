import Vue, {ComponentOptions, CreateElement, RenderContext, VNode} from "vue";
import VueRouter, {Location, RouteConfig} from "vue-router";
import {initAuth, isLoggedIn} from "@/js/utils/auth-utils";
import {getFullPageTitle} from "@/js/utils/router-utils";
import {providersModule, store} from "@/store/store";

Vue.use(VueRouter);

export const defaultPage: Location = {name: "home"};
export const defaultUnauthorizedPage: Location = {name: "login"};
export const notFoundPage: Location = {name: "404"};

export const specialParams = {
    redirectTo: "redirectTo"
};

const routerViewComponent: ComponentOptions<Vue> = {
    render(createElement: CreateElement) {
        return createElement("router-view")
    }
};

const routes: RouteConfig[] = [
    {
        name: "home",
        path: "/",
        meta: {title: "views.home.title"}
    },
    {
        name: "providers",
        path: "/providers",
        meta: {title: "views.providers.title"},
        component: () => import("@/views/providers/ProvidersView.vue")
    },
    {
        path: "/provider",
        redirect: {name: "providers"},
        component: routerViewComponent,
        children: [
            {
                name: "provider-info",
                path: ":providerId",
                props: (route) => ({providerId: route.params.providerId}),
                meta: {title: "views.provider-info.title"},
                component: () => import("@/views/providers/ProviderInfoView.vue")
            },
            {
                name: "create-provider",
                path: "new"
            },
            {
                path: ":providerId",
                component: routerViewComponent,
                children: [
                    {
                        name: "additional-ingredients-groups",
                        path: "additional-ingredients-groups",
                        props: (route) => ({providerId: route.params.providerId}),
                        meta: {title: "views.additional-ingredients-groups.title"},
                        component: () => import("@/views/additional-ingredients-groups/AdditionalIngredientsGroupsView.vue")
                    },
                    {
                        path: "additional-ingredients-group",
                        component: routerViewComponent,
                        children: [
                            {
                                name: "create-additional-ingredients-group",
                                path: "new",
                                props: (route) => ({providerId: route.params.providerId}),
                                meta: {title: "views.additional-ingredients-group-create.title"},
                                component: () => import("@/views/additional-ingredients-groups/AdditionalIngredientsGroupCreateView.vue")
                            },
                            {
                                name: "additional-ingredients-group-info",
                                path: ":additionalIngredientsGroupId",
                                props: (route) => ({
                                    providerId: route.params.providerId,
                                    additionalIngredientsGroupId: route.params.additionalIngredientsGroupId
                                }),
                                meta: {title: "views.additional-ingredients-group-info.title"},
                                component: () => import("@/views/additional-ingredients-groups/AdditionalIngredientsGroupInfoView.vue")
                            }
                        ]
                    }
                ]
            },
        ]
    },
    {
        name: "additional-ingredients-groups-default",
        path: "/additional-ingredients-groups",
        beforeEnter(to, from, next) {
            const stopProvidersSync = providersModule.syncProviders();

            let watching = true;
            const stopProvidersWatch = store.watch(() => providersModule.syncing, (syncing) => {
                if (!syncing) {
                    stopProvidersWatch?.();
                    stopProvidersSync();

                    watching = false;

                    next({
                        name: "additional-ingredients-groups",
                        params: {providerId: providersModule.sortedProviders[0].id}
                    });
                }
            }, {immediate: true});

            if (!watching) stopProvidersWatch();
        }
    },
    {
        name: "login",
        path: "/login",
        meta: {title: "views.login.title", layout: "empty", noAuth: true},
        props: (route) => ({redirectTo: route.query[specialParams.redirectTo]}),
        component: () => import("@/views/LoginView.vue"),
        beforeEnter(to, from, next) {
            if (isLoggedIn()) {
                next(defaultPage);
            }
            next();
        }
    },
    {
        name: "404",
        path: "/404",
        alias: "*",
        component: {
            render(createElement: CreateElement, context: RenderContext): VNode {
                return createElement("div", ["404"])
            }
        }
    }
];

export const router = new VueRouter({
    routes: routes,
    mode: "history"
});

router.beforeEach(async (to, from, next) => {
    await initAuth();

    if (!isLoggedIn() && !to.meta.noAuth) {
        next({
            ...defaultUnauthorizedPage,
            query: defaultUnauthorizedPage.query ? {
                ...defaultUnauthorizedPage.query,
                [specialParams.redirectTo]: to.fullPath
            } : {
                [specialParams.redirectTo]: to.fullPath
            }
        });
        return;
    }

    next();
});

router.afterEach((to, from) => {
    document.title = getFullPageTitle(to);
});
