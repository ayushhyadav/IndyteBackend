import { supportedMimes } from "../config/filesystem.js";
import { v4 as randomString } from "uuid";
import sharp from "sharp";
export const imageValidator = (size, mime) => {
  if (bytesToMb(size) > 2) {
    return "Image size must be less than 2 MB";
  } else if (!supportedMimes.includes(mime)) {
    return "Image must be type of png,jpg,jpeg,svg,webp,gif..";
  }

  return null;
};

export const validateImage = async (image) => {
  try {
    const buffer = await sharp(image.data)
      .resize({ width: 1080, fit: sharp.fit.cover })
      .toBuffer();
    return {
      key: randomString(),
      ContentType: image.mimetype,
      Body: buffer,
      Facing: image.facing,
    };
  } catch (error) {
    console.log(error);
    return { error: error.message };
  }
};

export const bytesToMb = (bytes) => {
  return bytes / (1024 * 1024);
};

export const generateRandomNum = () => {
  return randomString();
};

// export const getImageUrl = (imgName) => {
//   return `${process.env.APP_URL}/images/${imgName}`;
// };

// export const removeImage = (imageName) => {
//   const path = process.cwd() + "/public/images/" + imageName;
//   if (fs.existsSync(path)) {
//     fs.unlinkSync(path);
//   }
// };

// * Upload image
// export const uploadImage = (image) => {
//   const imgExt = image?.name.split(".");
//   const imageName = generateRandomNum() + "." + imgExt[1];
//   const uploadPath = process.cwd() + "/public/images/" + imageName;
//   image.mv(uploadPath, (err) => {
//     if (err) throw err;
//   });

//   return imageName;
// };
