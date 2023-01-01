import * as express from "express";
import { logger } from "./../tools/firebase";
import { Goal, ProjectCreation, ProjectOwner } from "../models/project.model";
import { authVerification } from "../tools/middlewares/auth-validation";
import { createBoard, createGoal, createProject, deactivateBoard, deactivateGoal, deactivateProject } from "./projects.service";
import * as cors from "cors";
import { getDoc } from "../services/db.service";

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
    const owner = {
      id: res.locals.user.uid,
      name: res.locals.user.name,
    };
    const creationResp = await createProject(owner, finalData);
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

app.post("/api/v1/createGoal", async (req, res) => {
  try {
    const body = req.body;
    const rawGoalData = body?.goalData;
    const projectId = body?.projectId;
    const owner = res.locals.user.uid;

    /*
     TODO: Maybe better to do an update (adding updatedAt) instead of a get and do the creation depending on the update
     In case of ok create, if not, return error
     This involves:
      - goals
      - boards
      - tasks
    */
    const projectData = await getDoc(`users/${owner}/projects/${projectId}`);
    if (!projectData.exists || projectData?.success === false) {
      return res.status(500).send({ success: false, message: "Problem detected with the project" }).end();
    }

    // Filter data
    const finalData: Goal = {
      name: rawGoalData?.name,
      active: rawGoalData?.active ?? true,
    };
    const creationResp = await createGoal(owner, projectId, finalData);
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

app.delete("/api/v1/deleteGoal", async (req, res) => {
  try {
    const projectId = req.body?.projectId;
    const goalId = req.body?.goalId;
    const owner = res.locals.user.uid;
    const deactivateResp = await deactivateGoal(owner, projectId, goalId);
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

app.post("/api/v1/createBoard", async (req, res) => {
  try {
    const body = req.body;
    const rawBoardData = body?.boardData;
    const goalId = body?.goalId;
    const projectId = body?.projectId;
    const owner = res.locals.user.uid;

    const goalData = await getDoc(`users/${owner}/projects/${projectId}/goals/${goalId}`);
    if (!goalData.exists || goalData?.success === false) {
      return res.status(500).send({ success: false, message: "Problem detected with the goal" }).end();
    }

    // Filter data
    const finalData: Goal = {
      name: rawBoardData?.name,
      active: rawBoardData?.active ?? true,
    };
    const creationResp = await createBoard(owner, projectId, goalId, finalData);
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

app.delete("/api/v1/deleteBoard", async (req, res) => {
  try {
    const projectId = req.body?.projectId;
    const goalId = req.body?.goalId;
    const boardId = req.body?.boardId;
    const owner = res.locals.user.uid;
    const deactivateResp = await deactivateBoard(owner, projectId, goalId, boardId);
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
