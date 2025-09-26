import { Router } from "express";
import { getHome } from "src/controller/home/homeController";

const router = Router();

router.route("/home").get(async (req, res, next) => {
  try {
    const home = await getHome();
    return res.status(200).send(home);
  } catch (error) {
    next(error);
  }
});

export default router;
