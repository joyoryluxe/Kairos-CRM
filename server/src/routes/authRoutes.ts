import { Router } from "express";
import { register, login, getMe, forgotPassword, resetPassword } from "../controllers/authController";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getMe);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:token", resetPassword);

export default router;
