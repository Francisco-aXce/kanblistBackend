import { admin, functions, db, logger } from "./tools/firebase";

logger.info(`Starting API, app: ${admin.app().name}`);
db.settings({ ignoreUndefinedProperties: true });

// #region API

export const apiprojects = functions.https.onRequest(async (req, res) => {
  await (await import("./projects/projects.api")).app(req, res);
});

export const apigoals = functions.https.onRequest(async (req, res) => {
  await (await import("./goals/goals.api")).app(req, res);
});

export const apiboards = functions.https.onRequest(async (req, res) => {
  await (await import("./boards/boards.api")).app(req, res);
});

export const apitasks = functions.https.onRequest(async (req, res) => {
  await (await import("./tasks/tasks.api")).app(req, res);
});

export const apiusers = functions.https.onRequest(async (req, res) => {
  await (await import("./users/users.api")).app(req, res);
});

// #endregion

// #region Document Triggers

export const createUser = functions.auth.user().onCreate(async (user) => {
  await (await import("./users/user.creation.trigger")).createUser(user);
});

// #endregion
