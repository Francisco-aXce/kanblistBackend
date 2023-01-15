import { UserRecord } from "firebase-admin/auth";
import { auth } from "../tools/firebase";

export const createUser = (user: UserRecord) => {
  return auth.setCustomUserClaims(user.uid, { maxProjects: 4 });
};
