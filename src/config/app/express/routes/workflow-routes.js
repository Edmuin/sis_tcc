import { Router } from "express";
import {
  createProposal,
  createStage,
  createSubmission,
  evaluateTcc,
  createOrientation,
  updateOrientation,
  notifications,
  overview,
  reviewProposal,
  reviewSubmission,
} from "../../../../controllers/workflow-controller.js";
import { allowRoles, requireAuth } from "../../../../middlewares/auth-middleware.js";
import { pdfUploadMiddleware } from "../../../../middlewares/upload-middleware.js";

const router = Router();
router.use(requireAuth);

router.get("/notifications", notifications);
router.get("/tcc/:id", allowRoles("aluno", "tutor", "coordenador", "juri", "administrador"), overview);
router.post("/tcc/:id/proposals", allowRoles("aluno", "coordenador"), createProposal);
router.post("/tcc/:id/proposals/review", allowRoles("coordenador", "administrador"), reviewProposal);
router.post("/tcc/:id/stages", allowRoles("tutor", "coordenador", "administrador"), createStage);
router.post("/tcc/:id/submissions", allowRoles("aluno"), pdfUploadMiddleware.single("documento"), createSubmission);
router.post("/tcc/:id/submissions/review", allowRoles("tutor", "coordenador", "administrador"), reviewSubmission);
router.post("/tcc/:id/evaluations", allowRoles("juri"), evaluateTcc);
router.post("/tcc/:id/orientations", allowRoles("aluno"), createOrientation);
router.post("/tcc/:id/orientations/update", allowRoles("tutor", "coordenador", "administrador"), updateOrientation);

export default router;
