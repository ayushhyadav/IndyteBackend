import express from "express";
import ApiRoutes from "./routes/api.js";
import cors from "cors";
import adminRoutes from "./routes/AdminRoutes.js";
import dieticianRoutes from "./routes/DieticianRoutes.js";
import userRoutes from "./routes/UserRoutes.js";
import genericAuth from "./controllers/auth/GenericAuthController.js";
import errorMiddleware from "./middleware/Error.js";
import exploreRoutes from "./routes/ExploreRoutes.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.status(200).json("Hello Server");
});

app.use("/api", ApiRoutes);
app.use("/api/user", userRoutes);
app.use("/api/dietician", dieticianRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/explore", exploreRoutes);
app.post("/api/auth/websiteLogin", genericAuth.login);

app.use(errorMiddleware);

app.listen(3000, () => {
  console.log("server running on 3000");
});
