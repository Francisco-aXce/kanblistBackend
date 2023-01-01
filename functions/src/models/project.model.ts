import { gralReadData } from "./data.model";

export interface ProjectCreation {
  name: string,
  image: string,
  description: string,
  active?: boolean,
}

export interface Project extends ProjectCreation, gralReadData { }

export interface Goal {
  name: string,
  active: boolean,
}

export interface ProjectOwner {
  id: string,
  name: string,
  email: string,
}

export interface ProjectMember extends ProjectOwner {
  role: string,
}
