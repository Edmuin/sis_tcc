import { Router } from "express";

import {
  createApproval,
  deleteApproval,
  listApprovals,
  updateApproval,
} from "../../../../../controllers/operational/approval-controller.js";

const router = Router();

router.get("/aprovacoes", listApprovals);
router.post("/aprovacoes", createApproval);
router.put("/aprovacoes/:id", updateApproval);
router.delete("/aprovacoes/:id", deleteApproval);

export default router;
