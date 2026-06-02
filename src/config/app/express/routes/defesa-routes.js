import { Router } from "express";

import {
  create,
  destroy,
  detail,
  edit,
  index,
  list,
  show,
  store,
  update,
} from "../../../../controllers/defesa-controller.js";
import { allowRoles, requireAuth } from "../../../../middlewares/auth-middleware.js";

const router = Router();

router.use(requireAuth, allowRoles("coordenador", "subdirecao", "subdireção"));

router.get("/", index);
router.get("/create", create);
router.get("/api", list);
router.get("/:id/api", detail);
router.post("/", store);
router.get("/:id", show);
router.get("/:id/edit", edit);
router.put("/:id", update);
router.post("/:id/update", update);
router.delete("/:id", destroy);
router.post("/:id/delete", destroy);

export default router;
