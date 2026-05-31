import { Router } from "express";

import {
  createResource,
  deleteResource,
  getResource,
  listResource,
  updateResource,
} from "../../../../../controllers/operational/generic-controller.js";

const router = Router();

router.get("/:resource", listResource);
router.post("/:resource", createResource);
router.get("/:resource/:id", getResource);
router.put("/:resource/:id", updateResource);
router.delete("/:resource/:id", deleteResource);

export default router;
