import * as express from "express";
import { logger } from "./../tools/firebase";
import { GoalCreation, ProjectCreation } from "../models/project.model";
import { authVerification } from "../tools/middlewares/auth-validation";
import { createBoard, createGoal, createProject, deactivateProject, editProject } from "./projects.service";
import * as cors from "cors";
import { arrayUnion, getDoc } from "../services/db.service";
import { userBelogsTo } from "../services/general.service";

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
      email: res.locals.user.email,
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

app.post("/api/v1/createGoal", async (req, res) => {
  try {
    const body = req.body;
    const rawGoalData = body?.goalData;
    const projectInfo = body?.projectInfo;
    const user = res.locals.user;

    const projectData = await getDoc(`users/${projectInfo.owner.id}/projects/${projectInfo.id}`);
    if (!projectData.exists || projectData?.success === false) {
      return res.status(500).send({ success: false, message: "Problem detected with the project" }).end();
    } else if (projectData?.owner?.id !== user.uid && !userBelogsTo(user, projectData?.shared)) {
      return res.status(500).send({ success: false, message: "No access to this project" }).end();
    }

    // Filter data
    const finalData: GoalCreation = {
      name: rawGoalData?.name,
      description: rawGoalData?.description,
      // order: rawGoalData?.order ?? 0,
      color: rawGoalData?.color,
      attendant: { id: user.uid },
      assigned: rawGoalData?.assigned ? arrayUnion(rawGoalData?.assigned) : undefined,
      active: rawGoalData?.active ?? true,
    };
    const creationResp = await createGoal(projectInfo.owner.id, projectInfo.id, finalData);
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

app.post("/api/v1/createBoard", async (req, res) => {
  try {
    const body = req.body;
    const rawBoardData = body?.boardData;
    const goalId = body?.goalId;
    const projectInfo = body?.projectInfo;
    const user = res.locals.user;

    const goalData = await getDoc(`users/${projectInfo.owner.id}/projects/${projectInfo.id}/goals/${goalId}`);
    if (!goalData.exists || goalData?.success === false) {
      return res.status(500).send({ success: false, message: "Problem detected with the goal" }).end();
    }

    // Filter data
    // TODO: Add type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalData: any = {
      name: rawBoardData?.name,
      active: rawBoardData?.active ?? true,
    };
    const creationResp = await createBoard(projectInfo.owner.id, projectInfo.id, goalId, finalData, user.uid);
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
*/
