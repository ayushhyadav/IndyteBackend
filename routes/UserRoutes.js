import { Router } from "express";
import { onlyAdmin, onlyUser } from "../middleware/Authenticate.js";
import UserAuthController from "../controllers/auth/UserAuthController.js";
const userRoutes = Router();

userRoutes.post("/registerOtp", UserAuthController.registerOtp);
userRoutes.post("/register", UserAuthController.register);
userRoutes.post("/emailLogin", UserAuthController.emailLogin);
userRoutes.post("/requestOtp", UserAuthController.loginOtp);
userRoutes.post("/phoneLogin", UserAuthController.phoneLogin);
userRoutes.get("/me", onlyUser, UserAuthController.me);
userRoutes.get("/me/:id", onlyAdmin, UserAuthController.me);
userRoutes.put("/update", onlyUser, UserAuthController.update);
userRoutes.put("/update/:id", onlyAdmin, UserAuthController.update);
userRoutes.put("/resetPassword", UserAuthController.resetPassword);

export default userRoutes;
