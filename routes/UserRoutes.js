import { Router } from "express";
import { onlyAdmin, onlyUser, allUser } from "../middleware/Authenticate.js";
import UserAuthController from "../controllers/auth/UserAuthController.js";
import Upload from "../controllers/upload/Upload.js";
const userRoutes = Router();
import fileUpload from "express-fileupload";

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

// Monthly photo routes
userRoutes.get("/progressPhoto", onlyUser, Upload.getMonthlyImage);
userRoutes.get("/progressPhoto/:id", onlyAdmin, Upload.getMonthlyImage);
userRoutes.post(
  "/progressPhoto",
  fileUpload(),
  onlyUser,
  Upload.addMonthlyImage
);
userRoutes.post(
  "/progressPhoto/:year/:month",
  fileUpload(),
  onlyUser,
  Upload.addMonthlyImage
);
userRoutes.delete(
  "/progressPhoto/delete/:id",
  allUser,
  Upload.deleteMonthlyImage
);
export default userRoutes;
