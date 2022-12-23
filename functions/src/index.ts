import { admin, functions, db, logger } from "./tools/firebase";

logger.info(`Starting API, app: ${admin.app().name}`);
db.settings({ ignoreUndefinedProperties: true });

export const apiprojects = functions.https.onRequest(async (req, res) => {
  await (await import("./projects/projects.api")).app(req, res);
});
