import { GoalCreation } from "../models/project.model";
import { addDocCol, arrayUnion, updateDoc } from "../services/db.service";
import { uploadByString } from "../services/storage.service";
import { db, serverTimestamp } from "../tools/firebase";

export const createGoal = async (owner: string, projId: string, data: GoalCreation) => {
  const projDocRef = db.doc(`users/${owner}/projects/${projId}`);
  const canCreateGoal = await projDocRef.get()
    .then((doc) => {
      const data = doc.data();
      const maxGoals = data?.maxGoals ?? 0;
      const goalsCount = data?.goals?.length ?? 0;
      return data?.active && goalsCount < maxGoals;
    })
    .catch(() => false);

  if (!canCreateGoal) return { success: false, message: "You have reached the maximum number of goals" };

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
    updateDoc(projDocRef, rootProjDataDB),
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
