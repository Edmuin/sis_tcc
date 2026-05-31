import { Router } from "express";

import { formLogin, login, logout, formRegister } from "../../../../controllers/auth-controller.js";

const router = Router();

router.get("/form-login", formLogin);
router.post("/login", login);
router.get("/register", formRegister);
router.get("/logout", logout);


export default router;