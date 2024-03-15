import { Router } from "express";
const userRoutes = Router();

userRoutes.get("/user/:id", (req, res) => {
  console.log("user");
});

export default userRoutes;
