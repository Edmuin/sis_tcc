import { Router } from "express";

import {
  createApproval,
  createResource,
  dashboardSummary,
  deleteApproval,
  deleteResource,
  getResource,
  listApprovals,
  listResource,
  reports,
  updateApproval,
  updateResource,
  uploadDocument,
} from "../../../../controllers/operational-controller.js";
import { requireApiAuth } from "../../../../middlewares/auth-middleware.js";
import { uploadMiddleware } from "../../../../middlewares/upload-middleware.js";

const router = Router();

router.use(requireApiAuth);

router.get("/dashboard", dashboardSummary);
router.get("/aprovacoes", listApprovals);
router.post("/aprovacoes", createApproval);
router.put("/aprovacoes/:id", updateApproval);
router.delete("/aprovacoes/:id", deleteApproval);
router.post("/documentos/upload", uploadMiddleware.single("ficheiro"), uploadDocument);
router.get("/relatorios", reports);
router.get("/:resource", listResource);
router.post("/:resource", createResource);
router.get("/:resource/:id", getResource);
router.put("/:resource/:id", updateResource);
router.delete("/:resource/:id", deleteResource);

export default router;
