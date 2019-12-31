import {firebaseAuth} from "@/plugins/firebase";

let initialized: boolean = false;

export function initAuth(): Promise<void> {
    return new Promise<void>((resolve) => {
        if (initialized) {
            resolve();
            return;
        }

        const unsubscribe = firebaseAuth.onAuthStateChanged(user => {
            unsubscribe();
            initialized = true;
            resolve();
        });
    });
}

export function isLoggedIn(): boolean {
    return firebaseAuth.currentUser != null && !firebaseAuth.currentUser.isAnonymous;
}
