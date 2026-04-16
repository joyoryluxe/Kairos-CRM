import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import authRoutes from "./authRoutes";
import maternityRoutes from "./maternityRoutes";
import influencerRoutes from "./influencerRoutes";
import corporateEventRoutes from "./corporateEventRoutes";
import dashboardRoutes from "./dashboardRoutes";
import googleAuthRoutes from "./googleAuthRoutes";
import packageRoutes from "./packageRoutes";
import studioExpenseRoutes from "./studioExpenseRoutes";
import leadRoutes from "./leadRoutes";
import editRoutes from "./editRoutes";
import suggestionRoutes from "./suggestionRoutes";

const router = Router();

// Public routes
router.use("/auth", authRoutes);
router.use("/google-auth", googleAuthRoutes);

// Protected Routes (everything below this point requires a valid token)
router.use(authenticate);

router.use("/maternity", maternityRoutes);
router.use("/influencer", influencerRoutes);
router.use("/corporate-events", corporateEventRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/packages", packageRoutes);
router.use("/studio-expenses", studioExpenseRoutes);
router.use("/leads", leadRoutes);
router.use("/edits", editRoutes);
router.use("/suggestions", suggestionRoutes);

export default router;
