import * as admin from "firebase-admin";
import {regionFunctions} from "./region";
import {customUsers, users} from "./constants";
import {User} from "./data";

async function createUser(userId: string): Promise<User> {
    const newUser: User = {};

    await admin.firestore()
        .collection(users.collection)
        .doc(userId)
        .create(newUser);

    return newUser;
}

async function createUserIfNotExists(userId: string): Promise<User> {
    const user = await admin.firestore()
        .collection(users.collection)
        .doc(userId)
        .get();

    if (!user.exists) {
        return await createUser(userId);
    }

    return user.data() as User;
}

export async function updateCustomUserClaims(userId: string, user: User) {
    await admin.auth().setCustomUserClaims(userId, {
        role: user.role || users.defaultRole
    });
}

export const on_user_create: any = regionFunctions.auth.user().onCreate(async (userRecord, context) => {
    const user = await createUserIfNotExists(userRecord.uid);
    await updateCustomUserClaims(userRecord.uid, user);
});

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
