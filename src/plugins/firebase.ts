import * as firebase from "firebase/app";
import "firebase/functions";
import "firebase/auth";
import "firebase/firestore";
import config from "@/firebase.config";
import {setFirestore} from "@/common/js/firestore-utils";

export const firebaseApp = firebase.initializeApp(config);
export const firebaseFunctions = firebaseApp.functions("europe-west1");
export const firebaseAuth = firebaseApp.auth();
export const firebaseFirestore = firebaseApp.firestore();

setFirestore(firebaseFirestore);