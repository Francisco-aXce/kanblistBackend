import { GoalCreation } from "../models/project.model";
import { addDocCol, arrayUnion, updateDoc } from "../services/db.service";
import { uploadByString } from "../services/storage.service";
import { db, serverTimestamp } from "../tools/firebase";

export const createGoal = (owner: string, projId: string, data: GoalCreation) => {
  const { description, ...dbData } = data;
  const goalDocRef = db.collection(`users/${owner}/projects/${projId}/goals`).doc();
  const goalId = goalDocRef.id;
  const rootProjDataDB = {
    goals: arrayUnion({ id: goalId }),
    updatedAt: serverTimestamp(),
    updatedBy: data.attendant.id,
  };

  const goalFolder = `users/${owner}/projects/${projId}/goals/${goalId}`;

  return Promise.all([
    addDocCol(`users/${owner}/projects/${projId}/goals`, dbData, goalId),
    updateDoc(`users/${owner}/projects/${projId}`, rootProjDataDB),
    uploadByString(description, `${goalFolder}/description.json`, "application/json"),
  ]).then((resp) => resp[0]).catch((error) => ({ success: false, message: error.message ?? error }));
};

/* export const deactivateGoal = (owner: string, projId: string, goalId: string) => {
  const deactivationData = {
    active: false,
    deactivationDate: serverTimestamp(),
  };
  return updateDoc(`users/${owner}/projects/${projId}/goals/${goalId}`, deactivationData);
}; */
