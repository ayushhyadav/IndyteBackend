import { Router } from "express";
import DieticianAuthController from "../controllers/auth/DieticianAuthController.js";
import auth, {
  onlyAdmin,
  onlyDietician,
  allUser,
  onlyUser,
} from "../middleware/Authenticate.js";
const dieticianRoutes = Router();

// auth dietician routes

dieticianRoutes.post("/register", onlyAdmin, DieticianAuthController.register);
dieticianRoutes.post("/login", DieticianAuthController.login);
dieticianRoutes.post("/requestOtp", DieticianAuthController.requestOtp);
dieticianRoutes.post(
  "/resetPassword",
  onlyDietician,
  DieticianAuthController.resetPassword
);
dieticianRoutes.get("/me", onlyDietician, DieticianAuthController.me);
dieticianRoutes.get("/me/:id", allUser, DieticianAuthController.getById);
dieticianRoutes.get("/getAll", allUser, DieticianAuthController.getAll);

dieticianRoutes.put("/update", onlyDietician, DieticianAuthController.update);
dieticianRoutes.put(
  "/update/:id",
  onlyAdmin,
  DieticianAuthController.updateById
);

dieticianRoutes.delete(
  "/delete/:id",
  onlyAdmin,
  DieticianAuthController.deleteDietician
);

export default dieticianRoutes;
