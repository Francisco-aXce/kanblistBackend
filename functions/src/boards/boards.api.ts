import * as express from "express";
import * as cors from "cors";
import { authVerification } from "../tools/middlewares/auth-validation";
import { getDoc } from "../services/db.service";
import { createBoard, editBoard } from "./boards.service";
import { logger } from "../tools/firebase";

export const app = express();
app.use(cors({
  origin: true,
}), authVerification());

app.post("/api/v1/create", async (req, res) => {
  try {
    const body = req.body;
    const rawBoardData = body?.boardData;
    const goalId = body?.goalId;
    const projectInfo = body?.projectInfo;
    const user = res.locals.user;

    // FIXME: There should be project shared system comprobation instead
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

app.post("/api/v1/edit", async (req, res) => {
  try {
    const body = req.body;
    const rawBoardData = body?.boardData;
    const goalId = body?.goalId;
    const boardId = body?.boardId;
    const projectInfo = body?.projectInfo;
    const user = res.locals.user;

    // FIXME: There should be project shared system comprobation instead
    const goalData = await getDoc(`users/${projectInfo.owner.id}/projects/${projectInfo.id}/goals/${goalId}`);
    if (!goalData.exists || goalData?.success === false) {
      return res.status(500).send({ success: false, message: "Problem detected with the goal" }).end();
    }

    // Filter data
    // TODO: Add type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalData: any = {
      name: rawBoardData?.name,
    };
    const response = await editBoard(projectInfo.owner.id, projectInfo.id, goalId, boardId, finalData, user.uid);
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
