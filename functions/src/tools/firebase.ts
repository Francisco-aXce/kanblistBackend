import * as Functions from "firebase-functions";
import * as Admin from "firebase-admin";

const admin = Admin;
admin.initializeApp();
const db = admin.firestore();
const functions = Functions;
const bucket = admin.storage().bucket();
const logger = Functions.logger;
const serverTimestamp = admin.firestore.FieldValue.serverTimestamp;

export { admin, db, functions, logger, serverTimestamp, bucket };
