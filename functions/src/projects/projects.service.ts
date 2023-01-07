import { GoalCreation, ProjectCreation, ProjectOwner } from "../models/project.model";
import { uploadByString } from "../services/storage.service";
import { db, serverTimestamp } from "../tools/firebase";
import { addDocCol, arrayUnion, updateDoc } from "./../services/db.service";

export const createProject = async (owner: ProjectOwner, data: ProjectCreation) => {
  const { description, ...dbData } = data;
  const projectDocRef = db.collection(`users/${owner.id}/projects`).doc();
  const projectId = projectDocRef.id;

  const projectFolder = `users/${owner.id}/projects/${projectId}`;

  return await Promise.all([
    addDocCol(`users/${owner.id}/projects`, { ...dbData, owner }, projectId),
    uploadByString(description, `${projectFolder}/description.json`, "application/json", "public, max-age=0"),
  ]).then((resp) => resp[0]).catch((error) => ({ success: false, message: error.message ?? error }));
};

export const editProject = async (owner: { id: string }, projId: string, data: ProjectCreation, userId: string) => {
  const { description, ...dbData } = data;
  const projectFolder = `users/${owner.id}/projects/${projId}`;

  return await Promise.all([
    updateDoc(`users/${owner.id}/projects/${projId}`, { ...dbData, updatedAt: serverTimestamp(), updatedBy: userId }),
    description ? uploadByString(description, `${projectFolder}/description.json`, "application/json", "public, max-age=0") : null,
  ]).then((resp) => resp[0]).catch((error) => ({ success: false, message: error.message ?? error }));
};

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
export const createTask = (owner: string, projId: string, goalId: string, boardId: string, data: any, userId: string) => {
  const dbData = {
    tasks: arrayUnion({ ...data }),
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  };

  return Promise.all([
    updateDoc(`users/${owner}/projects/${projId}/goals/${goalId}/boards/${boardId}`, dbData),
  ]).then((resp) => resp[0]).catch((error) => ({ success: false, message: error.message ?? error }));
};

export const deactivateProject = (owner: string, projId: string) => {
  const deactivationData = {
    active: false,
    deactivationDate: serverTimestamp(),
  };
  return updateDoc(`users/${owner}/projects/${projId}`, deactivationData);
};

export const deactivateGoal = (owner: string, projId: string, goalId: string) => {
  const deactivationData = {
    active: false,
    deactivationDate: serverTimestamp(),
  };
  return updateDoc(`users/${owner}/projects/${projId}/goals/${goalId}`, deactivationData);
};

export const deactivateBoard = (owner: string, projId: string, goalId: string, boardId: string) => {
  const deactivationData = {
    active: false,
    deactivationDate: serverTimestamp(),
  };
  return updateDoc(`users/${owner}/projects/${projId}/goals/${goalId}/boards/${boardId}`, deactivationData);
};

// export const deleteProject = (owner: string, projId: string) => {
//   return deleteDoc(`users/${owner}/projects/${projId}`);
// };
