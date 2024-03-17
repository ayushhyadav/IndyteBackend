import { Router } from "express";
import AdminAuthController from "../controllers/auth/AdminAuthController.js";
import { onlyAdmin } from "../middleware/Authenticate.js";

const adminRoutes = Router();

adminRoutes.post("/register", onlyAdmin, AdminAuthController.register);
adminRoutes.post("/login", AdminAuthController.login);
adminRoutes.get("/me", onlyAdmin, AdminAuthController.me);
adminRoutes.post("/requestOtp", AdminAuthController.requestOtp);
adminRoutes.put("/resetPassword", AdminAuthController.resetPassword);

adminRoutes.delete("/delete", onlyAdmin, AdminAuthController.deleteAdmin);

export default adminRoutes;
