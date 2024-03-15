import vine from "@vinejs/vine";
import { loginSchema, registerSchema } from "../../validations/authValidation";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOtp, verifyOtp } from "../otpController.js";
import prisma from "../../db/db.config.js";

class UserAuthController {
  static async register(req, res) {
    try {
      const body = req.body;
      const validator = vine.compile(registerSchema);
      const payload = await validator.validate(body);

      //   * Check if email exist
      const findUser = await prisma.user.findUnique({
        where: {
          phone: payload.phone,
          email: payload.email,
        },
      });

      if (findUser) {
        return res.status(400).json({
          errors: {
            phone: "phone or email already taken.please use another one.",
          },
        });
      }
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
}
