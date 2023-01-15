import * as express from "express";
import { logger } from "./../tools/firebase";
import { ProjectCreation } from "../models/project.model";
import { authVerification } from "../tools/middlewares/auth-validation";
import { createProject, deactivateProject, editProject } from "./projects.service";
import * as cors from "cors";

export const app = express();
app.use(cors({
  origin: true,
}), authVerification());

app.post("/api/v1/create", async (req, res) => {
  try {
    const body = req.body;
    const rawProjData = body?.projectData;

    // Filter data
    const finalData: ProjectCreation = {
      name: rawProjData?.name,
      image: rawProjData?.image,
      description: rawProjData?.description,
      active: rawProjData?.active ?? true,
    };
    const userInfo = {
      claims: res.locals.user,
      ownerData: {
        id: res.locals.user.uid,
      },
    };
    const creationResp = await createProject(userInfo, finalData);
    if (!creationResp.success) {
      logger.error(creationResp.message);
      return res.status(500).send({ success: false, message: creationResp.message }).end();
    }
    return res.status(200).send({ success: true, data: finalData }).end();
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ success: false }).end();
  }
});

app.put("/api/v1/edit", async (req, res) => {
  try {
    const body = req.body;
    const rawProjData = body?.projectData;
    const projId = body?.projectId;
    const owner = body?.owner;
    const user = res.locals.user;

    // Filter data
    const finalData: ProjectCreation = {
      name: rawProjData?.name,
      image: rawProjData?.image,
      description: rawProjData?.description,
    };
    const response = await editProject(owner, projId, finalData, user.uid);
    if (!response.success) {
      logger.error(response.message);
      return res.status(500).send({ success: false, message: response.message }).end();
    }
    return res.status(200).send({ success: true, data: finalData }).end();
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ success: false }).end();
  }
});

/*
  TODO: Passed certain time (days based in deactivation date) delete the project
  This involves:
  - projects
  - goals
  - tasks
*/
app.delete("/api/v1/delete", async (req, res) => {
  try {
    const projectId = req.body?.projectId;
    const owner = res.locals.user.uid;
    const deactivateResp = await deactivateProject(owner, projectId);
    if (!deactivateResp.success) {
      logger.error(deactivateResp.message);
      return res.status(500).send({ success: false, message: deactivateResp.message }).end();
    }
    return res.status(200).send({ success: true }).end();
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ success: false }).end();
  }
});
