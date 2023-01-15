import { ProjectCreation, User } from "../models/project.model";
import { UserClaims } from "../models/user.model";
import { uploadByString } from "../services/storage.service";
import { db, serverTimestamp } from "../tools/firebase";
import { addDocCol, increment, setDoc, updateDoc } from "./../services/db.service";

export const createProject = async (userInfo: { claims: UserClaims, ownerData: User }, data: ProjectCreation) => {
  const canCreate = await canCreateProject(userInfo.claims);
  if (!canCreate) return { success: false, message: "You have reached the maximum number of projects" };

  const { description, ...dbData } = data;
  const userDocRef = db.doc(`users/${userInfo.ownerData.id}`);
  const projectDocRef = db.collection(`users/${userInfo.ownerData.id}/projects`).doc();
  const projectId = projectDocRef.id;

  const projectFolder = `users/${userInfo.ownerData.id}/projects/${projectId}`;

  return await Promise.all([
    addDocCol(`users/${userInfo.ownerData.id}/projects`, { ...dbData, owner: userInfo.ownerData }, projectId),
    setDoc(userDocRef, { projectCount: increment(1), updatedAt: serverTimestamp() }, true),
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

export const deactivateProject = (owner: string, projId: string) => {
  const deactivationData = {
    active: false,
    deactivationDate: serverTimestamp(),
  };
  return updateDoc(`users/${owner}/projects/${projId}`, deactivationData);
};

const canCreateProject = async (userClaims: UserClaims) => {
  const userDoc = await db.doc(`users/${userClaims.uid}`).get();
  const user = userDoc.data();
  const projectCount = user?.projectCount ?? 0;
  const maxProjects = userClaims.maxProjects ?? 0;

  return projectCount < maxProjects;
};
