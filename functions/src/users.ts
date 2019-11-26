import * as admin from "firebase-admin";
import {regionFunctions} from "./region";
import {customUsers, users} from "./constants";

export const on_user_delete: any = regionFunctions.auth.user().onDelete(async (user, context) => {
    const isCustomUser = user.uid.startsWith(customUsers.prefix);

    if (isCustomUser) {
        const customUserId = user.uid.substring(customUsers.prefix.length);

        await admin.firestore()
            .collection(customUsers.collection)
            .doc(customUserId)
            .delete();
    }

    await admin.firestore()
        .collection(users.collection)
        .doc(user.uid)
        .delete();
});