import { Router } from "express";
import { all, create, findById, findByIdParam, destroy, edit, index, show, store, update } from "../../../../controllers/user-controller.js";
import { uploadMiddleware } from "../../../../middlewares/upload-middleware.js";
import { allowRoles } from "../../../../middlewares/auth-middleware.js";

const router = Router();

router.use(allowRoles("coordenador", "administrador"));

router.get("/", index);
router.get("/all", all);
router.get("/getusertoedit", findById);
router.get("/:id/data", findByIdParam);
router.get("/create", create);
router.post("/create", store);
router.get("/edit/:id", edit);
router.put("/edit/:id", update);
router.post("/edit/:id", update);
router.post("/edit", update);
router.delete("/:id", destroy);

export default router;
