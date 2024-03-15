import { Router } from "express";
import DieticianAuthController from "../controllers/auth/DieticianAuthController.js";
import auth, {
  onlyAdmin,
  onlyDietician,
  onlyUser,
} from "../middleware/Authenticate.js";
const dieticianRoutes = Router();

// auth dietician routes

dieticianRoutes.post("/register", DieticianAuthController.register);
dieticianRoutes.post("/login", DieticianAuthController.login);

dieticianRoutes.post(
  "/requestOtp",
  onlyDietician,
  DieticianAuthController.requestOtp
);
dieticianRoutes.post(
  "/resetPassword",
  onlyDietician,
  DieticianAuthController.resetPassword
);
dieticianRoutes.get("/me", onlyDietician, DieticianAuthController.me);
dieticianRoutes.get("/getAll", DieticianAuthController.getAll);
dieticianRoutes.get("/me/:id", DieticianAuthController.getById);

dieticianRoutes.put(
  "/updateDietician",
  onlyDietician,
  DieticianAuthController.update
);
dieticianRoutes.put(
  "/updateDietician/:id",
  onlyAdmin,
  DieticianAuthController.updateById
);

dieticianRoutes.delete(
  "/deleteDietician/:id",
  onlyAdmin,
  DieticianAuthController.deleteDietician
);

export default dieticianRoutes;
