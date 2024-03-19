import { Router } from "express";
import AdminAuthController from "../controllers/auth/AdminAuthController.js";
import { onlyAdmin, allUser } from "../middleware/Authenticate.js";
import BannerController from "../controllers/banner/BannerController.js";
import fileUpload from "express-fileupload";
const adminRoutes = Router();

adminRoutes.post("/register", onlyAdmin, AdminAuthController.register);
adminRoutes.post("/login", AdminAuthController.login);
adminRoutes.get("/me", onlyAdmin, AdminAuthController.me);
adminRoutes.post("/requestOtp", AdminAuthController.requestOtp);
adminRoutes.put("/resetPassword", AdminAuthController.resetPassword);
adminRoutes.delete("/delete/:id", onlyAdmin, AdminAuthController.deleteAdmin);

adminRoutes.post(
  "/addBanner",
  onlyAdmin,
  fileUpload(),
  BannerController.addBanner
);
adminRoutes.delete("/deleteBanner/:id", onlyAdmin, BannerController.deleteBanner);
adminRoutes.get("/banner", allUser, BannerController.getAllBanner);
export default adminRoutes;
