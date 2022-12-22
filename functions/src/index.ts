import { admin, functions, db } from "./tools/firebase";

// admin.initializeApp();
db.settings({ ignoreUndefinedProperties: true });

export const apiprojects = functions.https.onRequest(async (req, res) => {
  await (await import("./projects/projects.api")).app(req, res);
});
