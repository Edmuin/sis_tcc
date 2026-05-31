import { Router } from "express";

import { dashboardSummary, reports } from "../../../../../controllers/operational/system-controller.js";

const router = Router();

router.get("/dashboard", dashboardSummary);
router.get("/relatorios", reports);

export default router;
