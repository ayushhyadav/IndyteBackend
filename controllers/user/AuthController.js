import vine, { errors } from "@vinejs/vine";
import {
  loginSchema,
  registerSchema,
} from "../../validations/authValidation.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOtp, verifyOtp } from "../otpController.js";
import prisma from "../../db/db.config.js";

class AuthController {
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
      const otp = await sendOtp(req, res);

      // if(!verifyOtp){
      //     return res.status(400).json({
      //         errors: {
      //             phone: "Invalid OTP.",
      //           },
      //         });

      //   * Encrypt the password
      // const salt = bcrypt.genSaltSync(10);
      // payload.password = bcrypt.hashSync(payload.password, salt);
      //           // return res.json({payload})

      //             const user = await prisma.user.create({
      //                 data: payload,
      // });
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

  static async verifyOtpandRegister(req, res) {
    try {
      const payload = req.body;
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

      const otpData = await prisma.otp.findUnique({
        where: {
          phone: payload.phone,
        },
      });

      const salt = bcrypt.genSaltSync(10);
      payload.password = bcrypt.hashSync(payload.password, salt);

      if (otpData.otp === payload.otp) {
        const user = await prisma.user.create({
          data: {
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            password: payload.password,
            height: payload.height,
            weight: payload.weight,
            height_unit: payload.height_unit,
            weight_unit: payload.weight_unit,
            date_of_birth: payload.date_of_birth,
            gender: payload.gender,
            goal: payload.goal,
            profile: payload.profile,
          },
        });

        const payloadData = {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          profile: user.profile,
        };
        const token = jwt.sign(payloadData, process.env.JWT_SECRET, {
          expiresIn: "365d",
        });
        return res.json({
          status: 200,
          message: "User created successfully",
          user,
          token,
        });
      }
      return res.status(400).json({
        errors: {
          phone: "Invalid OTP.",
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

  static async otpLogin(req, res) {
    try {
      const { phone } = req.body;

      const findUser = await prisma.user.findUnique({
        where: {
          phone,
        },
      });
      if (findUser) {
        await sendOtp(req, res);
      } else {
        return res.status(400).json({
          errors: {
            phone: "No user found with this phone number.",
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

  static async verifyOtpandLogin(req, res) {
    try {
      const { phone, otp } = req.body;

      const otpData = await prisma.otp.findUnique({
        where: {
          phone,
        },
      });

      if (otpData.otp === otp) {
        const user = await prisma.user.findUnique({
          where: {
            phone: phone,
          },
        });
        const payloadData = {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          profile: user.profile,
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
          phone: "Invalid OTP.",
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

  static async login(req, res) {
    try {
      const body = req.body;
      const validator = vine.compile(loginSchema);
      const payload = await validator.validate(body);
      console.log(payload);

      //   * Find user with email
      const findUser = await prisma.user.findUnique({
        where: {
          email: payload.email,
        },
      });

      console.log(findUser);

      if (findUser) {
        if (!bcrypt.compareSync(payload.password, findUser.password)) {
          return res.status(400).json({
            errors: {
              email: "Invalid Credentials.",
            },
          });
        }

        // return res.json({message: "logged in "})

        // * Issue token to user
        const payloadData = {
          id: findUser.id,
          name: findUser.name,
          phone: findUser.phone,
          email: findUser.email,
          profile: findUser.profile,
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
          email: "No user found with this email.",
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
      const findUser = await prisma.user.findUnique({
        where: {
          phone,
        },
      });

      if (!findUser) {
        return res.status(400).json({
          message: "User not found for given Phone number",
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

    const findUser = await prisma.user.findUnique({
      where: {
        phone: phone,
      },
    });

    if (!findUser) {
      return res.status(400).json({
        message: "User not found for given Phone number",
      });
    }

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
      status: 200,
      data: {
        updatePassword,
      },
    });
  }
}

export default AuthController;
