import { Router } from "express";
import AdminAuthController from "../controllers/auth/adminAuthController.js";
import { onlyAdmin } from "../middleware/Authenticate.js";

const adminRoutes = Router();

adminRoutes.post("/register", AdminAuthController.register);
adminRoutes.post("/login", AdminAuthController.login);
adminRoutes.get("/me", onlyAdmin, AdminAuthController.me);
adminRoutes.post("/requestOtp", onlyAdmin, AdminAuthController.requestOtp);
adminRoutes.post(
  "/resetPassword",
  onlyAdmin,
  AdminAuthController.resetPassword
);

adminRoutes.delete("/delete", onlyAdmin, AdminAuthController.deleteAdmin);

export default adminRoutes;
