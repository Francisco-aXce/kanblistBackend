import { admin, functions, db } from "./tools/firebase";

// admin.initializeApp();
db.settings({ ignoreUndefinedProperties: true });

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const apiprojects = functions.https.onRequest(async (req, res) => {
  await (await import("./projects/projects.api")).app(req, res);
});
