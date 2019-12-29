import Vue, {CreateElement, RenderContext, VNode} from "vue";
import VueRouter, {Location, RouteConfig} from "vue-router";
import {initAuth, isLoggedIn} from "@/js/utils/auth-utils";
import {getFullPageTitle} from "@/js/utils/router-utils";

Vue.use(VueRouter);

export const defaultPage: Location = {name: "home"};
export const defaultUnauthorizedPage: Location = {name: "login"};
export const notFoundPage: Location = {name: "404"};

export const specialParams = {
    redirectTo: "redirectTo"
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
        children: [
            {
                name: "provider",
                path: ":providerId"
            },
            {
                name: "create-provider",
                path: "new"
            }
        ]
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
