import { Router } from "express";
import { all, create, findById, destroy, edit, index, show, store, update } from "../../../../controllers/user-controller.js";
import { uploadMiddleware } from "../../../../middlewares/upload-middleware.js";

const router = Router();

router.get("/", index);
router.get("/all", all);
router.get("/getusertoedit", findById);
router.get("/create", create);
router.post("/create", store);
router.get("/edit/:id", edit);
router.put("/edit/:id", update);
router.delete("/:id", destroy);

export default router;
