import express from "express";
import { createRouteHandler } from "uploadthing/express";
// import uploadRouter from "./config/uploadthing.js";
import "dotenv/config";
import fileUpload from "express-fileupload";
import ApiRoutes from "./routes/api.js";
import cors from "cors";
import adminRoutes from "./routes/AdminRoutes.js";
import dieticianRoutes from "./routes/DieticianRoutes.js";
import userRoutes from "./routes/UserRoutes.js";
import genericAuth from "./controllers/auth/GenericAuthController.js";
import authRoutes from "./routes/AuthRoutes.js";

const app = express();

app.use(cors());
// def middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());

// app.use(
//   "/api/uploadthing",
//   createRouteHandler({
//     router: uploadRouter,
//     config: {
//       uploadthingId: process.env.UPLOADTHING_APP_ID,
//       uploadthingSecret: process.env.UPLOADTHING_SECRET,
//       isDev: true,
//     },
//   })
// );

app.get("/", (req, res) => {
  res.send("Hello Server");
});
app.get("/check", (req, res) => res.send("Hello checking"));

app.use("/api", ApiRoutes);
app.use("/api/user", userRoutes);
app.use("/api/dietician", dieticianRoutes);
app.use("/api/admin", adminRoutes);
app.post("/api/websiteLogin", genericAuth.login);

app.listen(3000, () => {
  console.log("server running on 3000");
});
