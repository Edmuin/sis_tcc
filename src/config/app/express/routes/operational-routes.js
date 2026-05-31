import { Router } from "express";

import { requireApiAuth } from "../../../../middlewares/auth-middleware.js";
import approvalRoutes from "./operational/approval-routes.js";
import documentRoutes from "./operational/document-routes.js";
import genericRoutes from "./operational/generic-routes.js";
import systemRoutes from "./operational/system-routes.js";

const router = Router();

router.use(requireApiAuth);

router.use(systemRoutes);
router.use(approvalRoutes);
router.use(documentRoutes);
router.use(genericRoutes);

export default router;
