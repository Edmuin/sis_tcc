import { Router } from "express";

import {
  changeStatus,
  create,
  destroy,
  detail,
  edit,
  index,
  list,
  options,
  show,
  store,
  update,
} from "../../../../controllers/tcc-controller.js";
import { pdfUploadMiddleware } from "../../../../middlewares/upload-middleware.js";

const router = Router();
const tccPdfFields = pdfUploadMiddleware.fields([
  { name: "relatorio_pdf", maxCount: 1 },
]);

router.get("/", index);
router.get("/create", create);
router.get("/api", list);
router.get("/options", options);
router.get("/:id/api", detail);
router.post("/", tccPdfFields, store);
router.get("/:id", show);
router.get("/:id/edit", edit);
router.patch("/:id/status", changeStatus);
router.post("/:id/status", changeStatus);
router.put("/:id", tccPdfFields, update);
router.post("/:id/update", tccPdfFields, update);
router.delete("/:id", destroy);
router.post("/:id/delete", destroy);

export default router;
