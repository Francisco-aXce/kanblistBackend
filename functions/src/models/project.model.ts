import { firestore } from "firebase-admin";
import { gralReadData } from "./data.model";

export interface ProjectCreation {
  name: string,
  image: string,
  description: string,
  active?: boolean,
}

export interface Project extends ProjectCreation, gralReadData { }

export interface GoalCreation {
  name: string,
  description: string,
  // order: number,
  color?: string,
  attendant: {
    id: string,
  },
  assigned?: [
    {
      id: string,
    }
  ] | firestore.FieldValue,
  active: boolean,
}

export interface Goal extends GoalCreation, gralReadData { }

export interface User {
  id: string,
}

export interface ProjectMember extends User {
  role: string,
}
