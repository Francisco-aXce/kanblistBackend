import { Project } from "../models/project.model";
import { addDocCol } from "./../services/db.service";

export const createProject = async (owner: string, data: Project) => {
  return addDocCol(`users/${owner}/projects`, data);
};
