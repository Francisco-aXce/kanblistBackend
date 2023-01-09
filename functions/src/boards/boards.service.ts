import { addDocCol, arrayUnion, updateDoc } from "../services/db.service";
import { db, serverTimestamp } from "../tools/firebase";

// TODO: Add type for data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createBoard = (owner: string, projId: string, goalId: string, data: any, userId: string) => {
  const dbData = data;
  const goalDocRef = db.collection(`users/${owner}/projects/${projId}/goals/${goalId}/boards`).doc();
  const boardId = goalDocRef.id;
  const rootGoalDataDB = {
    boards: arrayUnion({ id: boardId }),
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  };

  return Promise.all([
    addDocCol(`users/${owner}/projects/${projId}/goals/${goalId}/boards`, dbData, boardId),
    updateDoc(`users/${owner}/projects/${projId}/goals/${goalId}`, rootGoalDataDB),
  ]).then((resp) => resp[0]).catch((error) => ({ success: false, message: error.message ?? error }));
};

// TODO: Add type for data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const editBoard = (owner: string, projId: string, goalId: string, boardId: string, data: any, userId: string) => {
  const dbData = {
    ...data,
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  };

  return Promise.all([
    updateDoc(`users/${owner}/projects/${projId}/goals/${goalId}/boards/${boardId}`, dbData),
  ]).then((resp) => resp[0]).catch((error) => ({ success: false, message: error.message ?? error }));
};

/* export const deactivateBoard = (owner: string, projId: string, goalId: string, boardId: string) => {
  const deactivationData = {
    active: false,
    deactivationDate: serverTimestamp(),
  };
  return updateDoc(`users/${owner}/projects/${projId}/goals/${goalId}/boards/${boardId}`, deactivationData);
}; */
