import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {regionFunctions} from "./region";
import {customUsers, users} from "./constants";

interface LoginData {
    username: string | any;
    password: string | any;
}

function getUserId(customUserId: string): string {
    return customUsers.prefix + customUserId;
}

async function encryptPassword(password: string): Promise<string> {
    return await require("bcrypt").hash(password, customUsers.saltRounds);
}

async function createUserFromCustomUser(customUserId: string, username: string): Promise<admin.firestore.WriteResult> {
    const newUser = {
        username: username
    };

    return await admin.firestore()
        .collection(users.collection)
        .doc(getUserId(customUserId))
        .create(newUser);
}

async function createUserFromCustomUserIfNotExists(customUserId: string, username: string): Promise<boolean> {
    const user = await admin.firestore()
        .collection(users.collection)
        .doc(customUserId)
        .get();

    if (!user.exists) {
        await createUserFromCustomUser(customUserId, username);
        return true;
    }

    return false;
}

export const auth_login: any = regionFunctions.https.onCall(async (data: LoginData, context) => {
    function throwInvalid() {
        throw new functions.https.HttpsError("invalid-argument", "Invalid username or password.", "invalid-credentials");
    }

    if (!data.username || typeof data.username !== "string" || !data.password || typeof data.password !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "Username or password was not provided.");
    }

    const querySnapshot = await admin.firestore()
        .collection(customUsers.collection)
        .where("username", "==", data.username)
        .limit(1)
        .get();

    if (querySnapshot.empty) throwInvalid();

    const customUserDoc = querySnapshot.docs[0];
    const customUserData = customUserDoc.data();

    if (customUserData.encrypted === false) {
        if (data.password !== customUserData.password) {
            throwInvalid();
        }

        await Promise.all([
            customUserDoc.ref.update({
                "password": await encryptPassword(customUserData.password),
                "encrypted": admin.firestore.FieldValue.delete()
            }),
            createUserFromCustomUserIfNotExists(customUserDoc.ref.id, customUserData.username)
        ]);
    } else if (!await require("bcrypt").compare(data.password, customUserData.password)) {
        throwInvalid();
    }

    return await admin.auth().createCustomToken(getUserId(customUserDoc.id));
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

    await createUserFromCustomUserIfNotExists(customUserRef.id, data.username);
});