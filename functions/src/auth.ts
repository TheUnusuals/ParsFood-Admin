import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {regionFunctions} from "./region";

interface LoginData {
    username: string | any;
    password: string | any;
}

export const customUsersCollection = "custom-users";
export const customUserUidPrefix = "custom-user@";
export const saltRounds = 10;

export const auth_login: any = regionFunctions.https.onCall(async (data: LoginData, context) => {
    function throwInvalid() {
        throw new functions.https.HttpsError("invalid-argument", "Invalid username or password.", "invalid-credentials");
    }

    if (!data.username || typeof data.username !== "string" || !data.password || typeof data.password !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "Username or password was not provided.");
    }

    const querySnapshot = await admin.firestore()
        .collection(customUsersCollection)
        .where("username", "==", data.username)
        .limit(1)
        .get();

    if (querySnapshot.empty) throwInvalid();

    const userDoc = querySnapshot.docs[0];

    if (!await require("bcrypt").compare(data.password, userDoc.data().password)) {
        throwInvalid();
    }

    const userUid = customUserUidPrefix + userDoc.id;

    return await admin.auth().createCustomToken(userUid);
});

interface RegisterData {
    username: string | any;
    password: string | any;
}

export const auth_register: any = regionFunctions.https.onCall(async (data: RegisterData, context) => {
    if (!data.username || typeof data.username !== "string" || !data.password || typeof data.password !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "Username or password was not provided.");
    }

    await admin.firestore().runTransaction(async (transaction) => {
        const querySnapshot = await transaction.get(
            admin.firestore()
                .collection(customUsersCollection)
                .where("username", "==", data.username)
                .limit(1)
        );

        if (!querySnapshot.empty) {
            throw new functions.https.HttpsError("invalid-argument", "Username is already taken.", "username-taken");
        }

        const newUser = {
            username: data.username,
            password: await require("bcrypt").hash(data.password, saltRounds)
        };

        const userRef = admin.firestore().collection(customUsersCollection).doc();

        transaction.create(userRef, newUser);
    });

    return true;
});