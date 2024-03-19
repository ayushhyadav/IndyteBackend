import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../../config/S3.js";
import { validateImage } from "../../utils/helper.js";
class Upload {
  static monthlyImage = async (req, res) => {
    try {
      // console.log(req.files);
      // console.log(req.files.image.data);

      if (!req.files)
        return res.status(400).json({ message: "No image found." });

      const buffers = [];
      const image = req.files;
      for (const key in image) {
        const item = image[key];
        if (Array.isArray(item)) item.forEach((e) => buffers.push(e));
        else buffers.push(item);
      }

      const uploadImage = await Promise.all(
        buffers.map(async (buffer) => {
          const image = await validateImage(buffer);
          return image;
        })
      );

      if (uploadImage.filter((err) => err.error).length !== 0)
        return res.status(400).json({ message: "Not a valid image" });

      console.log(uploadImage);

      uploadImage.forEach((image) => {
        const params = {
          Bucket: process.env.BUCKET_NAME,
          Key: req.files.image.name,
          Body: req.files.image.data,
          ContentType: req.files.image.mimetype,
        };
      });

      // const check = await validateImage(req.files.image);
      // console.log(check)

      // const command = new PutObjectCommand(params);
      // console.log(command);
      // const response = await s3.send(command);
      // console.log(response);
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
