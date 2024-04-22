import vine from "@vinejs/vine";
import {
  loginSchema,
  registerSchema,
  generateOtpSchema,
  validatorCompile,
  updateSchema,
} from "../../validations/authValidation.js";
import { generateToken } from "../../helpers/privacy.js";
import bcrypt from "bcryptjs";
import { sendOTP } from "../otpController.js";
import prisma from "../../db/db.config.js";
export default class UserAuthController {
  static async registerOtp(req, res) {
    try {
      const validator = await validatorCompile(generateOtpSchema, req.body);

      if (validator.error)
        return res.status(400).json({ message: validator.error });

      const findUser = await prisma.user.findFirst({
        where: {
          phone: validator.phone,
          email: {
            contains: validator.email,
            mode: "insensitive",
          },
        },
      });

      if (findUser) {
        return res.status(400).json({
          message: "Phone or email already exists",
        });
      }
      const phone = validator.phone;
      const requestOtp = await sendOTP(phone);
      if (requestOtp.error) {
        console.log(requestOtp);
        return res.status(500).json({ message: "Internal server error" });
      }
      return res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
      console.log("The error is", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async register(req, res) {
    try {
      const validator = await validatorCompile(registerSchema, req.body);
      if (validator.error)
        return res.status(400).json({ message: validator.error });
      if (!req.body.otp)
        return res.status(401).json({ message: "Otp not found" });

      const findUser = await prisma.user.findFirst({
        where: {
          OR: [
            {
              phone: validator.phone,
            },
            {
              email: {
                contains: validator.email,
                mode: "insensitive",
              },
            },
          ],
        },
      });
      if (findUser)
        return res.status(400).json({
          message: "User already exists",
        });
      const otpData = await prisma.otp.findUnique({
        where: {
          phone: validator.phone,
        },
      });
      if (!otpData)
        return res.status(404).json({ message: "Phone number not verified." });
      const salt = bcrypt.genSaltSync(10);
      const newPassword = bcrypt.hashSync(validator.password, salt);
      if (otpData.otp === req.body.otp) {
        const user = await prisma.user.create({
          data: { ...validator, password: newPassword },
        });

        const { password, ...all } = user;

        const token = await generateToken({ ...user, role: "user" });
        return res.status(201).json({
          status: 200,
          user: { ...all },
          token: `Bearer ${token}`,
          role: "user",
        });
      }
      return res.status(400).json({
        message: "Invalid otp.",
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async emailLogin(req, res) {
    try {
      const validator = await validatorCompile(loginSchema, req.body);
      if (validator.error)
        return res.status(400).json({ message: validator.error });
      const findUser = await prisma.user.findFirst({
        where: {
          email: {
            contains: validator.email,
            mode: "insensitive",
          },
        },
      });

      console.log(findUser);

      if (findUser) {
        if (!bcrypt.compareSync(validator.password, findUser.password)) {
          return res
            .status(400)
            .json({ message: "Invalid email or password." });
        }
        const token = await generateToken({ ...findUser, role: "user" });
        const { password, ...all } = findUser;
        return res.status(201).json({
          ...all,
          access_token: `Bearer ${token}`,
          role: "user",
        });
      }
      return res.status(400).json({
        message: "User does not exist",
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async loginOtp(req, res) {
    try {
      const { phone } = req.body;
      if (!phone)
        return res.status(404).json({ message: "Phone number is required." });
      const findUser = await prisma.user.findMany({
        where: {
          phone,
        },
      });
      if (findUser.length == 0)
        return res.status(400).json({ message: "User not found." });
      else if (findUser.length == 1) {
        const otp = await sendOTP(phone);
        if (otp.error)
          return res.status(400).json({ message: "Error sending Otp." });
        return res.status(200).json({ message: "OTP sent successfully" });
      } else {
        return res.status(400).json({
          message: "More than one account found. Please login with email.",
        });
      }
    } catch (error) {
      console.log("The error is", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async phoneLogin(req, res) {
    try {
      const { phone, otp } = req.body;
      if (!phone || !otp)
        return res.status(400).json({ message: "Phone or OTP not given." });

      const otpData = await prisma.otp.findUnique({
        where: {
          phone,
        },
      });

      if (otpData.otp == otp) {
        const user = await prisma.user.findUnique({
          where: {
            phone,
          },
        });
        if (!user) return res.status(404).json({ message: "User not found" });
        const { password, ...all } = user;
        const token = await generateToken({ ...user, role: "user" });
        return res.status(201).json({
          ...all,
          access_token: `Bearer ${token}`,
          role: "user",
        });
      }
      return res.status(400).json({
        message: "Invalid otp.",
      });
    } catch (error) {
      console.log("The error is", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async me(req, res) {
    try {
      console.log(req.user);
      const { id } =
        req.user.role == "admin" || req.user.role == "dietician"
          ? req.params
          : req.user;
        
      const user = await prisma.user.findUnique({
        where: {
          id,
        },
      });
      if (!user) return res.status(404).json({ message: "User not found." });
      const { password, ...all } = user;
      const token = await generateToken({ ...user, role: "user" });
      return res.status(201).json({
        ...all,
        access_token: `Bearer ${token}`,
        role: "user",
      });
    } catch (error) {
      console.log("The error is", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async update(req, res) {
    try {
      let { id } = req.user.role !== "admin" ? req.user : req.params;

      const validator = await validatorCompile(updateSchema, req.body);
      if (validator.error)
        return res.status(400).json({ message: validator.error });
      // Update user data
      const user = await prisma.user.update({
        data: validator,
        where: { id },
      });
      if (!user) return res.status(400).json({ message: "User not found" });
      return res.status(200).json({
        message: "User data updated successfully!",
      });
    } catch (error) {
      console.log("The error is", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async resetPassword(req, res) {
    try {
      const { phone, otp, password } = req.body;
      if (!phone || !otp || !password) {
        return res.status(400).json({
          message: "Please provide phone, otp and password",
        });
      }
      const findUser = await prisma.user.findUnique({
        where: {
          phone: phone,
        },
      });
      if (!findUser) return res.status(404).json({ message: "User not found" });

      const oldOtp = await prisma.otp.findUnique({
        where: {
          phone,
        },
      });

      if (oldOtp.otp !== otp) {
        return res.status(400).json({
          message: "Invalid OTP",
        });
      }

      const salt = bcrypt.genSaltSync(10);
      const newPassword = bcrypt.hashSync(password, salt);

      const updatePassword = await prisma.user.update({
        where: {
          id: findUser.id,
        },
        data: {
          password: newPassword,
        },
      });

      return res.status(200).json({
        message: "Password updated successfully",
        role: "user",
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Internal Server Error" });
    }
  }
}
