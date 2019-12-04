import {RawLocation, Route} from "vue-router";
import {defaultPage, notFoundPage, router} from "@/plugins/router";

export function isLocationInternal(location: RawLocation): boolean {
    return router.resolve(location).route.path !== router.resolve(notFoundPage).route.path;
}

export async function safeRedirect(unsafeLocation: RawLocation, fallbackLocation: RawLocation = defaultPage): Promise<Route> {
    if (isLocationInternal(unsafeLocation)) {
        return await router.push(unsafeLocation);
    } else {
        return await router.push(fallbackLocation);
    }
}