import { Router } from "express";
import { index, createForm, show, store } from "../../../../controllers/user-controller.js";
import { uploadMiddleware } from "../../../../middlewares/upload-middleware.js";

const router = Router();

router.get("/", index);
router.get("/create", createForm);
router.get("/:id", show);
router.post("/", store);

export default router;
