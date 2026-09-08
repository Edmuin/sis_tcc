import { Router } from "express";

import { signin, login, logout, signup, selectType, register, signup_aluno, signup_professor, signup_coordenador, userType, currentUser, updateCurrentUser, registrationCourses, registrationAreas, forgotPasswordPage, forgotPasswordResult, forgotPassword } from "../../../../controllers/auth-controller.js";
import { requireAuth } from "../../../../middlewares/auth-middleware.js";

const router = Router();

router.get("/sign-in", signin);
router.get("/form-login", signin);
router.get("/forgot-password", forgotPasswordPage);
router.get("/forgot-password/result", forgotPasswordResult);
router.post("/forgot-password", forgotPassword);
router.post("/login", login);
router.get("/me", currentUser);
router.patch("/me", requireAuth, updateCurrentUser);
router.get("/registration/courses", registrationCourses);
router.get("/registration/areas", registrationAreas);
router.get("/user-type", userType);
router.post("/select-type", selectType);
router.get("/sign-up/aluno", signup_aluno);
router.get("/sign-up/professor", signup_professor);
router.get("/sign-up/coordenador", signup_coordenador);
router.post("/register", register);
router.get("/logout", logout);


export default router;