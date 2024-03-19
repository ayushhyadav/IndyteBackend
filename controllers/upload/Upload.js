import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../../config/S3.js";

class Upload {
  static monthlyImage = async (req, res) => {
    try {
      console.log(req.files);
      console.log(req.files.image.data);

      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: req.files.image.name,
        Body: req.files.image.data,
        ACL: "public-read",
        ContentType: req.files.image.mimetype,
      };

      const command = new PutObjectCommand(params);
      console.log(command);
      const response = await s3.send(command);
      console.log(response);
      return res.status(200).json("hello");
    } catch (error) {
      console.log("The error is", error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong.Please try again.",
      });
    }
  };
}

export default Upload;
