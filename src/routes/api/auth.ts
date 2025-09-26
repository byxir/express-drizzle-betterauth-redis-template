import { Router } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "src/lib/authConfig";

const router = Router();

// Expose a simple session endpoint using Better Auth
router.get("/session", async (req, res, next) => {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    return res.status(200).json(session ?? null);
  } catch (error) {
    next(error);
  }
});

export default router;
