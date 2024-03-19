import s3, { getSignedImage } from "../../config/S3.js";
import prisma from "../../db/db.config.js";
import { validateImage } from "../../utils/helper.js";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

export default class BannerController {
  static addBanner = async (req, res) => {
    try {
      const name = req.body.name;
      if (!name)
        return res.status(200).json({ message: "Please provide banner name" });

      if (!req.files)
        return res.status(400).json({ message: "No banner image found." });
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

      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `banner/${uploadImage[0].key}`,
        Body: uploadImage[0].Body,
        ContentType: uploadImage[0].ContentType,
        Metadata: {
          caption: name || uploadImage[0].key,
        },
      };

      const command = new PutObjectCommand(params);
      const response = await s3.send(command);

      if (response) {
        await prisma.banner.create({
          data: {
            name,
            mimetype: uploadImage[0].ContentType,
            imgLink: `banner/${uploadImage[0].key}`,
          },
        });
      }

      return res.status(201).json({
        message: "Banner created successfully",
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: error.message });
    }
  };

  static getAllBanner = async (req, res) => {
    try {
      const banner = await prisma.banner.findMany();
      for (const data of banner) {
        data.imgLink = await getSignedImage(data.imgLink);
      }
      return res.status(200).json(banner);
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  static deleteBanner = async (req, res) => {
    try {
      const id = req.params.id;
      const findBanner = await prisma.banner.findUnique({ where: { id } });
      console.log(findBanner);
      if (!findBanner)
        return res
          .status(404)
          .json({ message: "Banner not found for given Id" });

      const deleteParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: findBanner.imgLink,
      };

      const deleted = await prisma.banner.delete({ where: { id } });
      if (!deleted)
        return res.status(400).json({ message: "Banner not found" });
      const command = new DeleteObjectCommand(deleteParams);
      s3.send(command);
      res.status(200).json({ message: "Banner deleted successfully" });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}
