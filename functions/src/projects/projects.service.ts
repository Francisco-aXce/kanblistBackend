import { Goal, Project } from "../models/project.model";
import { serverTimestamp } from "../tools/firebase";
import { addDocCol, updateDoc } from "./../services/db.service";

export const createProject = (owner: string, data: Project) => {
  return addDocCol(`users/${owner}/projects`, data);
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
