import { Goal, GoalCreation, ProjectCreation, ProjectOwner } from "../models/project.model";
import { uploadByString } from "../services/storage.service";
import { db, serverTimestamp } from "../tools/firebase";
import { addDocCol, updateDoc } from "./../services/db.service";

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

  const goalFolder = `users/${owner}/projects/${projId}/goals/${goalId}`;

  return Promise.all([
    addDocCol(`users/${owner}/projects/${projId}/goals`, dbData, goalId),
    updateDoc(`users/${owner}/projects/${projId}`, { updatedAt: serverTimestamp(), updatedBy: data.attendant.id }),
    uploadByString(description, `${goalFolder}/description.json`, "application/json"),
  ]).then((resp) => resp[0]).catch((error) => ({ success: false, message: error.message ?? error }));
};

export const createBoard = (owner: string, projId: string, goalId: string, data: Goal) => {
  return addDocCol(`users/${owner}/projects/${projId}/goals/${goalId}/boards`, data);
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
