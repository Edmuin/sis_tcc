import { Router } from "express";

import { uploadDocument } from "../../../../../controllers/operational/document-controller.js";
import { uploadMiddleware } from "../../../../../middlewares/upload-middleware.js";

const router = Router();

router.post("/documentos/upload", uploadMiddleware.single("ficheiro"), uploadDocument);

export default router;
