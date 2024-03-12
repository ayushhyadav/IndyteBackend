import { createUploadthing } from "uploadthing/express";
const f = createUploadthing();

const uploadRouter = {
  videoAndImage: f({
    image: {
      maxFileSize: "4MB",
    },
    
  }).onUploadComplete((data) => {
    console.log("upload completed", data);
  }),
};

export default uploadRouter;
