import Vue from "vue";
import VueRouter, {Location, RouteConfig} from "vue-router";
import {initAuth, isLoggedIn} from "@/js/utils/auth-utils";

Vue.use(VueRouter);

export const defaultPage: Location = {name: "home"};
export const defaultUnauthorizedPage: Location = {name: "login"};
export const notFoundPage: Location = {name: "404"};

export const specialParams = {
    redirectTo: "redirectTo"
};

const routes: RouteConfig[] = [
    {
        name: "login",
        path: "/login",
        meta: {layout: "empty", noAuth: true},
        props: (route) => ({redirectTo: route.query[specialParams.redirectTo]}),
        component: () => import("@/views/LoginView.vue"),
        beforeEnter(to, from, next) {
            if (isLoggedIn()) {
                next(defaultPage);
            }
            next();
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