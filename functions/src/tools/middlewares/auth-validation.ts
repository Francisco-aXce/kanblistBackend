import { Request, Response, NextFunction } from "express";
import { admin } from "../firebase";

// Function to send error response
const middlewareFailed = (res: Response, next: NextFunction, status = 400, err?: string | { code: string }) => {
  const errorJSON = { ok: false };
  const error = (typeof err === "string" ? err : err?.code) || "UNAUTHORIZED";

  res.status(status).json({ error, ...errorJSON });
  return next(`middlewareFailed: ${error}`);
};

export const authVerification = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers?.authorization;
    const type = authHeader?.split(" ")?.[0];
    const token = authHeader?.split(" ")?.[1];
    if (!authHeader || !token || !(type === "Bearer")) return middlewareFailed(res, next, 401, "No auth token provided/invalid");

    try {
      const decodedToken = await admin.auth().verifyIdToken(token, true);
      res.locals.user = decodedToken;
      return next();
    } catch {
      return middlewareFailed(res, next, 401);
    }
  };
};
