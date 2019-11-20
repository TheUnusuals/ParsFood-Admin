import * as admin from "firebase-admin";
import {regionFunctions} from "./region";
import {customUsersCollection, customUserUidPrefix} from "./auth";

export const on_user_delete: any = regionFunctions.auth.user().onDelete(async (user, context) => {
    const isCustomUser = user.uid.startsWith(customUserUidPrefix);

    if (isCustomUser) {
        const customUserId = user.uid.substring(customUserUidPrefix.length);

        await admin.firestore()
            .collection(customUsersCollection)
            .doc(customUserId)
            .delete();
    }
});