import {functions} from "firebase";

export function isHttpsError(error: any): error is functions.HttpsError {
    return error instanceof Object && error.code != null && error.message != null;
}