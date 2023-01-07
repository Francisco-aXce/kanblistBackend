import * as express from "express";
import * as cors from "cors";
import { authVerification } from "../tools/middlewares/auth-validation";
import { auth, logger } from "../tools/firebase";

export const app = express();
app.use(cors({
  origin: true,
}), authVerification());

app.get("/api/v1/info/:uid", async (req, res) => {
  const uid = req.params.uid;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = await auth.getUser(uid).then((userRecord) => {
    return userRecord.toJSON();
  }).catch((error) => {
    logger.info(`Error getting user: ${error}`);
    return res.status(500).end;
  });
  const finalData = {
    id: user.uid,
    email: user.email,
    name: user.displayName,
  };
  return res.status(200).send(finalData);
});
