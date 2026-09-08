import { Router } from "express";

import { signin, login, logout, signup, selectType, register, signup_aluno, signup_professor, signup_coordenador, userType, currentUser, updateCurrentUser, registrationCourses, registrationAreas, forgotPasswordPage, forgotPasswordResult, forgotPassword } from "../../../../controllers/auth-controller.js";
import { requireAuth } from "../../../../middlewares/auth-middleware.js";
import rateLimit from "express-rate-limit";

const router = Router();
const forgotPasswordLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 5,
	standardHeaders: true,
	legacyHeaders: false,
	message: { message: "Demasiadas tentativas. Tente novamente mais tarde." },
});
const registerLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: { message: "Demasiadas tentativas de cadastro. Tente novamente mais tarde." },
});

router.get("/sign-in", signin);
router.get("/form-login", signin);
router.get("/forgot-password", forgotPasswordPage);
router.get("/forgot-password/result", forgotPasswordResult);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/login", login);
router.get("/me", currentUser);
router.patch("/me", requireAuth, updateCurrentUser);
router.get("/registration/courses", registrationCourses);
router.get("/registration/areas", registrationAreas);
router.get("/user-type", userType);
router.post("/select-type", selectType);
router.get("/sign-up/aluno", signup_aluno);
router.get("/sign-up/professor", signup_professor);
router.post("/register", registerLimiter, register);
router.get("/logout", logout);


export default router;
