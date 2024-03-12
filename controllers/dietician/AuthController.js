import vine, { errors } from "@vinejs/vine";
import { loginSchema } from "../../validations/authValidation.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../db/db.config.js";
import { sendOtp } from "../otpController.js";

class DieticianAuthController {
  static async login(req, res) {
    try {
      const body = req.body;
      const validator = vine.compile(loginSchema);
      const payload = await validator.validate(body);

      //   * Find user with email
      const findDietician = await prisma.dietician.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (findDietician) {
        if (!bcrypt.compareSync(payload.password, findDietician.password)) {
          return res.status(400).json({
            errors: {
              password: "Invalid Credentials.",
            },
          });
        }

        // return res.json({message: "logged in "})

        // * Issue token to user
        const payloadData = {
          id: findDietician.id,
          name: findDietician.name,
          phone: findDietician.phone,
          email: findDietician.email,
        };
        const token = jwt.sign(payloadData, process.env.JWT_SECRET, {
          expiresIn: "365d",
        });

        return res.json({
          message: "Logged in",
          access_token: `Bearer ${token}`,
        });
      }

      return res.status(400).json({
        errors: {
          email: "No dietician found with this email.",
        },
      });
    } catch (error) {
      console.log("The error is", error);
      if (error instanceof errors.E_VALIDATION_ERROR) {
        // console.log(error.messages);
        return res.status(400).json({ errors: error.messages });
      } else {
        return res.status(500).json({
          status: 500,
          message: "Something went wrong.Please try again.",
        });
      }
    }
  }

  static async forgotPasswordSendOtp(req, res) {
    const { phone } = req.body;
    try {
      const findDietician = await prisma.dietician.findUnique({
        where: {
          phone,
        },
      });

      if (!findDietician) {
        return res.status(400).json({
          message: "dietician not found for given email",
        });
      }

      const otp = await sendOtp(req, res);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "something went wrong please try again later",
      });
    }
  }

  static async resetPassword(req, res) {
    const { phone, otp, password } = req.body;

    const findDietician = await prisma.dietician.findUnique({
      where: {
        phone: phone,
      },
    });

    const oldOtp = await prisma.otp.findUnique({
      where: {
        phone,
      },
    });

    console.log(oldOtp, otp);

    if (oldOtp.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const newPassword = bcrypt.hashSync(password, salt);

    const updatePassword = await prisma.dietician.update({
      where: {
        id: findDietician.id,
      },
      data: {
        password: newPassword,
      },
    });

    return res.status(200).json({
      message: "Password updated successfully",
      status: 200,
      data: {
        updatePassword,
      },
    });
  }
}

export default DieticianAuthController;
