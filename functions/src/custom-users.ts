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

    if (!await require("bcrypt").compare(data.password, customUserDoc.data().password)) {
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
            password: await require("bcrypt").hash(data.password, customUsers.saltRounds)
        };

        customUserRef = admin.firestore().collection(customUsers.collection).doc();

        transaction.create(customUserRef, newCustomUser);
    });

    const newUser = {
        username: data.username
    };

    await admin.firestore()
        .collection(users.collection)
        .doc(getUserId(customUserRef.id))
        .create(newUser);
});