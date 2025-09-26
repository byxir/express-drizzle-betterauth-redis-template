import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "src/lib/authConfig";
import { AuthError } from "src/utils/error";

export const onlyIfLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) {
    throw new AuthError("Not logged in! Please login to continue");
  }
  next();
};
