import express from "express";
import { createRouteHandler } from "uploadthing/express";
import uploadRouter from "./config/uploadthing.js";
import "dotenv/config";
import fileUpload from "express-fileupload";
import ApiRoutes from "./routes/api.js";

import cors from "cors";

const app = express();

app.use(cors());
// def middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());

app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter,
    config: {
      uploadthingId: process.env.UPLOADTHING_APP_ID,
      uploadthingSecret: process.env.UPLOADTHING_SECRET,
      isDev: true,
    },
  })
);

app.get("/", (req, res) => {
  res.send("hello");
});

app.use("/api", ApiRoutes);

app.listen(3000, () => {
  console.log("server running on 3000");
});
