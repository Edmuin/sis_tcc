import { Router } from "express";

import { dashboardSummary, coordinationReport } from "../../../../../controllers/operational/system-controller.js";

const router = Router();

router.get("/dashboard", dashboardSummary);
router.get("/coordination-report", coordinationReport);

export default router;
