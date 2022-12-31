import { Goal, ProjectCreation } from "../models/project.model";
import { uploadByString } from "../services/storage.service";
import { db, serverTimestamp } from "../tools/firebase";
import { addDocCol, updateDoc } from "./../services/db.service";

export const createProject = async (owner: string, data: ProjectCreation) => {
  const dbData = {
    name: data.name,
    image: data.image,
    active: data.active,
  };
  const description = data.description;
  const projectDocRef = db.collection(`users/${owner}/projects`).doc();
  const projectId = projectDocRef.id;

  const projectFolder = `users/${owner}/projects/${projectId}`;

  return await Promise.all([
    addDocCol(`users/${owner}/projects`, dbData, projectId),
    uploadByString(description, `${projectFolder}/description.json`, "application/json"),
  ]).then((resp) => resp[0]).catch((error) => (error));
};

export const createGoal = (owner: string, projId: string, data: Goal) => {
  return addDocCol(`users/${owner}/projects/${projId}/goals`, data);
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
