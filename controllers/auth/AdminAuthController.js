import prisma from "../../db/db.config.js";
import bcrypt from "bcryptjs";
import { sendOtp } from "../otpController.js";
import { generateToken } from "../../helpers/privacy.js";

import {
  validatorCompile,
  adminRegisterSchema,
  dieticianLoginSchema,
} from "../../validations/authValidation.js";

export default class AdminAuthController {
  static async register(req, res) {
    try {
      const body = req.body;
      const validate = await validatorCompile(adminRegisterSchema, body);
      if (validate.error)
        return res.status(406).json({ message: validate.error });
      const findAdmin = await prisma.admin.findFirst({
        where: {
          OR: [
            { email: body.email },
            { phone: body.phone },
            { username: body.username },
          ],
        },
      });

      if (findAdmin) {
        return res.status(400).json({
          message: "Email or phone already registered.",
        });
      }
      const salt = bcrypt.genSaltSync(10);
      const hashedPass = {
        ...validate,
        password: bcrypt.hashSync(body.password, salt),
      };

      const admin = await prisma.admin.create({
        data: hashedPass,
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          username: true,
        },
      });
      const token = generateToken({ ...admin, role: "admin" });
      return res.status(201).json({
        ...admin,
        access_token: `Bearer ${token}`,
        role: "admin",
      });
    } catch (error) {
      console.log("The error is", error);
      return res.status(401).json({ message: "Something went wrong" });
    }
  }
  static async login(req, res) {
    try {
      const body = req.body;
      const payload = await validatorCompile(dieticianLoginSchema, body);
      if (payload.error)
        return res.status(406).json({ message: payload.error });

      const findAdmin = await prisma.admin.findUnique({
        where: {
          email: payload.email,
        },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          username: true,
          password: true,
        },
      });

      if (findAdmin) {
        if (!bcrypt.compareSync(payload.password, findAdmin.password)) {
          return res.status(400).json({
            errors: {
              password: "Invalid Credentials.",
            },
          });
        }
        const payloadData = {
          id: findAdmin.id,
          name: findAdmin.name,
          username: findAdmin.username,
          phone: findAdmin.phone,
          email: findAdmin.email,
          role: "dietician",
        };
        const token = await generateToken(payloadData);

        return res.json({
          ...payloadData,
          access_token: `Bearer ${token}`,
          role: "admin",
        });
      }

      return res.status(400).json({
        message: "Please check your email and try again.",
      });
    } catch (error) {
      console.log("The error is", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async me(req, res) {
    const { id } = req.user;
    try {
      const findAdmin = await prisma.admin.findUnique({
        where: {
          id,
        },
      });
      if (!findAdmin) {
        return res.status(400).json({
          message: "Admin not found for given email",
        });
      }
      const { password, ...all } = findAdmin;
      return res.status(200).json({
        ...all,
        role: "admin",
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        message: "Something went wrong please try again later",
      });
    }
  }

  static async requestOtp(req, res) {
    const { phone } = req.body;
    if (!phone)
      return res.status(404).json({ message: "No user found with the id" });
    console.log(phone);
    try {
      const findAdmin = await prisma.admin.findUnique({
        where: {
          phone,
        },
      });
      if (!findAdmin) {
        return res.status(400).json({
          message: "admin not found for given email",
        });
      }
      await sendOtp(req, res);
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        message: "Something went wrong please try again later",
      });
    }
  }
  static async resetPassword(req, res) {
    try {
      const { phone, otp, password } = req.body;
      const findAdmin = await prisma.admin.findUnique({
        where: {
          phone: phone,
        },
      });
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

      const updatePassword = await prisma.admin.update({
        where: {
          id: findDietician.id,
        },
        data: {
          password: newPassword,
        },
      });

      return res.status(200).json({
        message: "Password updated successfully",
        role: "admin",
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: `Something went wrong!` });
    }
  }
  static async deleteAdmin(req, res) {
    try {
      const { id } = req.params;

      // Delete the dietician
      const dietician = await prisma.admin.delete({
        where: {
          id: id,
        },
      });
      if (!dietician)
        return res.status(400).json({ message: "User not found" });
      const { password, ...all } = dietician;
      return res.status(201).json({
        message: "Dietician deleted successfully",
        ...all,
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: `Something went wrong!` });
    }
  }
}
