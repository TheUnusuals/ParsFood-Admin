import * as firebase from "firebase/app";
import config from "@/firebase.config";

export const firebaseApp = firebase.initializeApp(config);