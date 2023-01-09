import * as express from "express";
import * as cors from "cors";
import { authVerification } from "../tools/middlewares/auth-validation";
import { arrayUnion, getDoc } from "../services/db.service";
import { userBelogsTo } from "../services/general.service";
import { GoalCreation } from "../models/project.model";
import { createGoal } from "./goals.service";
import { logger } from "../tools/firebase";

export const app = express();
app.use(cors({
  origin: true,
}), authVerification());

app.post("/api/v1/create", async (req, res) => {
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
*/
