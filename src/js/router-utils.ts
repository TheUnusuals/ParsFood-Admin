import {RawLocation, Route} from "vue-router";
import {defaultPage, notFoundPage, router} from "@/plugins/router";
import {i18n} from "@/plugins/i18n";

export const siteTitle = "app.title";

export function isLocationInternal(location: RawLocation): boolean {
    return router.resolve(location).route.name !== notFoundPage.name;
}

export async function safeRedirect(unsafeLocation: RawLocation, fallbackLocation: RawLocation = defaultPage): Promise<Route> {
    if (isLocationInternal(unsafeLocation)) {
        return await router.push(unsafeLocation);
    } else {
        return await router.push(fallbackLocation);
    }
}

export function getPageTitle(route: Route | null | undefined = router.currentRoute): string {
    if (route) {
        for (let routeRecord of route.matched)
            if (routeRecord.meta.title) return i18n.t(routeRecord.meta.title) as string;
    }
    return i18n.t(siteTitle) as string;
}

export function getFullPageTitle(route: Route | null | undefined = router.currentRoute): string {
    if (route) {
        const routeTitles: string[] = [];
        for (let routeRecord of route.matched)
            if (routeRecord.meta.title) routeTitles.push(i18n.t(routeRecord.meta.title) as string);
        if (routeTitles.length) return routeTitles.join(" - ") + " | " + i18n.t(siteTitle);
    }
    return i18n.t(siteTitle) as string;
}
