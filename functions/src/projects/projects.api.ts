import * as express from "express";
import { logger } from "./../tools/firebase";
import { Project } from "../models/project.model";
import { authVerification } from "../tools/middlewares/auth-validation";
import { createProject } from "./projects.service";
import * as cors from "cors";

export const app = express();
app.use(cors({
  origin: true,
}), authVerification());

app.post("/api/v1/create", async (req, res) => {
  try {
    const body = req.body;
    const rawProjData = body?.projectData;

    const finalData: Project = {
      name: rawProjData?.name,
    };
    const owner = res.locals.user.uid;
    const creationResp = await createProject(owner, finalData);
    if (!creationResp.success) {
      return res.status(500).send({ success: false, message: creationResp.message }).end();
    }
    return res.status(200).send({ success: true, data: finalData }).end();
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ success: false }).end();
  }
});
