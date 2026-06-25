import { Router } from "express";

import { roles } from "../../../../controllers/role-controller.js";

const router = Router();

router.get("/", roles);

export default router;