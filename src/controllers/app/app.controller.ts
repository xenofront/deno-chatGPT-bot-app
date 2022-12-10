import { Router } from "oak";

const router = new Router();

router.get("/app", ({ response }) => {
  response.body = "alive";
  response.status = 200;
});

export default router;
