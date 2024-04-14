import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3, { getSignedImage } from "../../config/S3.js";
import { validateImage } from "../../utils/helper.js";
import {
  formatDate,
  isValidObjectId,
  getDateRange,
} from "../../helpers/dateValidate.js";
import {
  dateMonthScheme,
  validatorCompile,
} from "../../validations/authValidation.js";
import prisma from "../../db/db.config.js";
class Upload {
  static updateProfilePicture = async (req, res) => {
    try {
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
      const params = {
        Bucket: "indyteprofile",
        Key: `profile/${uploadImage[0].key}`,
        Body: uploadImage[0].Body,
        ContentType: uploadImage[0].ContentType,
      };

      const userAvailable = await prisma.user.findFirst({
        where: { id: req.user?.id },
      });

      if (!userAvailable) {
        return res.status(404).json({ message: "User not found" });
      }
      const command = new PutObjectCommand(params);
      const response = await s3.send(command);
      if (response) {
        await prisma.user.update({
          where: { id: req.user?.id },
          data: {
            profile: `${process.env.S3_PUBLIC_URL}/profile/${uploadImage[0].key}`,
          },
        });

        return res.status(200).json({
          profile: `${process.env.S3_PUBLIC_URL}/profile/${uploadImage[0].key}`,
        });
      }
      return res.status(500).json({
        message: "Something went wrong. Please try again",
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  };
  static addMonthlyImage = async (req, res) => {
    let date = formatDate(new Date());
    try {
      const user = req.user;
      if (req.params.month) {
        const newDate = await validatorCompile(dateMonthScheme, req.params);
        if (newDate.error)
          return res.status(400).json({ error: newDate.error });
        date = formatDate(new Date(newDate.year, newDate.month - 1, 1));
      }
      if (!req.files)
        return res.status(400).json({ message: "No image found." });
      const buffers = [];
      const image = req.files;
      for (const key in image) {
        const item = image[key];
        if (Array.isArray(item))
          item.forEach((e) => {
            e.facing = key;
            buffers.push(e);
          });
        else {
          item.facing = key;
          buffers.push(item);
        }
      }
      const uploadImage = await Promise.all(
        buffers.map(async (buffer) => {
          const image = await validateImage(buffer);
          return image;
        })
      );
      if (uploadImage.filter((err) => err.error).length !== 0)
        return res.status(400).json({ message: "Not a valid image" });
      uploadImage.forEach(async (image) => {
        try {
          const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: `progressPhoto/${user.id}/${image.key}`,
            Body: image.Body,
            ContentType: image.ContentType,
          };
          const command = new PutObjectCommand(params);
          const response = await s3.send(command);
          if (response) {
            await prisma.progressPhoto.create({
              data: {
                date,
                userId: user.id,
                facing: image.Facing,
                mimetype: image.ContentType,
                imgLink: `progressPhoto/${user.id}/${image.key}`,
              },
            });
          }
        } catch (error) {
          console.log(error);
        }
      });
      return res.status(200).json({ message: "Upload image successfully" });
    } catch (error) {
      console.log("The error is", error);
      return res.status(500).json({
        message: error.message,
      });
    }
  };

  static deleteMonthlyImage = async (req, res) => {
    try {
      const user = req.user;
      let fetch = {};
      user.role === "admin"
        ? (fetch = { id: req.params.id })
        : (fetch = { userId: user.id, id: req.params.id });
      const id = req.params.id;

      if (!isValidObjectId(id))
        return res.status(403).json({ message: "Invalid image id" });

      const findPhoto = await prisma.progressPhoto.findUnique({
        where: fetch,
      });

      if (!findPhoto)
        return res
          .status(404)
          .json({ message: "Photo not found for the given id" });

      const deleteParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: findPhoto.imgLink,
      };
      const deleted = await prisma.progressPhoto.delete({ where: { id } });
      if (!deleted) return res.status(400).json({ message: "Photo not found" });
      const command = new DeleteObjectCommand(deleteParams);
      s3.send(command);
      res.status(200).json({ message: "Photo deleted successfully" });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  static getMonthlyImage = async (req, res) => {
    const user = req.user;
    let date = req.query.date;
    if (!date) date = "allTime";
    const id = req.params.id;
    try {
      if (id && isValidObjectId(id) && user.role == "admin") {
        user.id = id;
      }
      const queryData = async (days, currentDate) => {
        const { startDate, endDate } = getDateRange(days, currentDate);
        const progressPhoto = await prisma.progressPhoto.findMany({
          where: {
            userId: user.id,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        });
        const parseDate = Promise.all(
          progressPhoto.map(async (data) => {
            try {
              const url = await getSignedImage(data.imgLink);
              return {
                id: data.id,
                date: data.date,
                facing: data.facing,
                mime: data.mimetype,
                imgLink: url,
              };
            } catch (error) {
              return {
                id: data.id,
                date: data.date,
                facing: data.facing,
                mime: data.mimetype,
                imgLink: "error",
              };
            }
          })
        );
        return res.status(200).json(await parseDate);
      };

      let yearRegex = /^\d{4}$/;
      let monthRegex = /^(?:19|20)\d\d-(?:0[1-9]|1[0-2])$/;
      if (yearRegex.test(date)) {
        await queryData(365, new Date(date, 12, 31));
      } else if (monthRegex.test(date)) {
        await queryData(30, new Date(date));
      } else if (date == "allTime") {
        await queryData(365 * 10, new Date());
      } else {
        return res.status(400).json({
          message:
            "Invalid date it must be in format year YYYY or month YYYY-MM or alltime",
        });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}

export default Upload;
