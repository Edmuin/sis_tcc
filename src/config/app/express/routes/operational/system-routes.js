import { Router } from "express";

import { dashboardSummary } from "../../../../../controllers/operational/system-controller.js";

const router = Router();

router.get("/dashboard", dashboardSummary);

export default router;
