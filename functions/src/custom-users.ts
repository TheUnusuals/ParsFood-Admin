import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {regionFunctions} from "./region";
import {customUsers, users} from "./constants";
import {updateCustomUserClaims} from "./users";
import {CustomUser, User} from "./data";

function getUserId(customUserId: string): string {
    return customUsers.prefix + customUserId;
}

async function encryptPassword(password: string): Promise<string> {
    return await require("bcrypt").hash(password, customUsers.saltRounds);
}

async function createUserFromCustomUser(customUserId: string, customUser: CustomUser): Promise<User> {
    const newUser = {
        username: customUser.username
    };

    await admin.firestore()
        .collection(users.collection)
        .doc(getUserId(customUserId))
        .create(newUser);

    const userSnapshot = await admin.firestore()
        .collection(users.collection)
        .doc(getUserId(customUserId))
        .get();

    return userSnapshot.data() as User;
}

async function createUserFromCustomUserIfNotExists(customUserId: string, customUser: CustomUser): Promise<User> {
    const userSnapshot = await admin.firestore()
        .collection(users.collection)
        .doc(getUserId(customUserId))
        .get();

    if (!userSnapshot.exists)
        return await createUserFromCustomUser(customUserId, customUser);

    return userSnapshot.data() as User;
}

async function createFirebaseUserIfNotExists(userId: string) {
    let userRecord: admin.auth.UserRecord;

    try {
        userRecord = await admin.auth().getUser(userId);
    } catch (e) {
        console.log(`Could not find user with id ${userId}.`, e);
        userRecord = await admin.auth().createUser({uid: userId});
    }

    return userRecord;
}

interface LoginData {
    username: string | any;
    password: string | any;
}

export const auth_login: any = regionFunctions.https.onCall(async (data: LoginData, context) => {
    function throwInvalid() {
        throw new functions.https.HttpsError("invalid-argument", "Invalid username or password.", "invalid-credentials");
    }

    if (!data.username || typeof data.username !== "string" || !data.password || typeof data.password !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "Username or password was not provided.");
    }

    const userQuerySnapshot = await admin.firestore()
        .collection(customUsers.collection)
        .where("username", "==", data.username)
        .limit(1)
        .get();

    if (userQuerySnapshot.empty) throwInvalid();

    const customUserDoc = userQuerySnapshot.docs[0];
    const userId = getUserId(customUserDoc.id);
    const customUser: CustomUser = customUserDoc.data() as CustomUser;

    let user: User | null = null;

    if (customUser.encrypted === false) {
        if (data.password !== customUser.password) {
            throwInvalid();
        }

        const results = await Promise.all([
            customUserDoc.ref.update({
                "password": await encryptPassword(customUser.password),
                "encrypted": admin.firestore.FieldValue.delete()
            }),
            createUserFromCustomUserIfNotExists(customUserDoc.id, customUser),
            createFirebaseUserIfNotExists(userId)
        ]);

        user = results[1];
    } else if (!await require("bcrypt").compare(data.password, customUser.password)) {
        throwInvalid();
    }

    if (!user) {
        const userSnapshot = await admin.firestore().collection(users.collection).doc(userId).get();
        user = userSnapshot.data() as User;
    }

    await updateCustomUserClaims(userId, user);

    return await admin.auth().createCustomToken(userId);
});

interface RegisterData {
    username: string | any;
    password: string | any;
}

export const auth_register: any = regionFunctions.https.onCall(async (data: RegisterData, context) => {
    if (!data.username || typeof data.username !== "string" || !data.password || typeof data.password !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "Username or password was not provided.");
    }

    let customUserRef!: admin.firestore.DocumentReference;

    await admin.firestore().runTransaction(async (transaction) => {
        const customUserQuerySnapshot = await transaction.get(
            admin.firestore()
                .collection(customUsers.collection)
                .where("username", "==", data.username)
                .limit(1)
        );

        if (!customUserQuerySnapshot.empty) {
            throw new functions.https.HttpsError("invalid-argument", "Username is already taken.", "username-taken");
        }

        const newCustomUser = {
            username: data.username,
            password: await encryptPassword(data.password)
        };

        customUserRef = admin.firestore().collection(customUsers.collection).doc();

        transaction.create(customUserRef, newCustomUser);
    });

    const customUserSnapshot = await customUserRef.get();

    await createUserFromCustomUserIfNotExists(customUserRef.id, customUserSnapshot.data() as CustomUser);
});
