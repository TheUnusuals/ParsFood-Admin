import * as firebase from "firebase/app";
import "firebase/functions";
import "firebase/auth";
import config from "@/firebase.config";

export const firebaseApp = firebase.initializeApp(config);
export const firebaseFunctions = firebaseApp.functions("europe-west1");
export const firebaseAuth = firebaseApp.auth();