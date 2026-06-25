import { Router } from "express";

import { signin, login, logout, signup, selectType, register, signup_aluno, signup_professor, signup_coordenador, userType,  } from "../../../../controllers/auth-controller.js";

const router = Router();

router.get("/sign-in", signin);
router.post("/login", login);
router.get("/user-type", userType);
router.post("/select-type", selectType);
router.get("/sign-up/aluno", signup_aluno);
router.get("/sign-up/professor", signup_professor);
router.get("/sign-up/coordenador", signup_coordenador);
router.post("/register", register);
router.get("/logout", logout);


export default router;