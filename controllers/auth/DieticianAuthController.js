import prisma from "../../db/db.config.js";
import bcrypt from "bcryptjs";
import { sendOtp } from "../otpController.js";

import {
  dieticianRegisterSchema,
  dieticianLoginSchema,
  validatorCompile,
} from "../../validations/authValidation.js";

import { generateToken } from "../../helpers/privacy.js";
class DieticianAuthController {
  static async register(req, res) {
    try {
      const body = req.body;
      const validate = await validatorCompile(dieticianRegisterSchema, body);
      if (validate.error)
        return res.status(406).json({ message: validate.error });
      const findDietician = await prisma.dietician.findFirst({
        where: {
          OR: [
            { email: body.email },
            { phone: body.phone },
            { username: body.username },
          ],
        },
      });

      if (findDietician) {
        return res.status(400).json({
          message: "Email or phone already registered.",
        });
      }
      const salt = bcrypt.genSaltSync(10);
      const hashedPass = {
        ...validate,
        password: bcrypt.hashSync(body.password, salt),
      };

      const dietician = await prisma.dietician.create({
        data: hashedPass,
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          username: true,
        },
      });
      const token = await generateToken({ ...dietician, role: "dietician" });
      return res.status(201).json({
        ...dietician,
        token,
        role: "dietician",
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

      const findDietician = await prisma.dietician.findUnique({
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

      if (findDietician) {
        if (!bcrypt.compareSync(payload.password, findDietician.password)) {
          return res.status(400).json({
            errors: {
              password: "Invalid Credentials.",
            },
          });
        }
        const payloadData = {
          id: findDietician.id,
          name: findDietician.name,
          username: findDietician.username,
          phone: findDietician.phone,
          email: findDietician.email,
          role: "dietician",
        };
        const token = await generateToken(payloadData);

        return res.json({
          ...payload,
          access_token: `Bearer ${token}`,
          role: "dietician",
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

  static async requestOtp(req, res) {
    const { phone } = req.user;
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
      await sendOtp(req, res);
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        message: "Something went wrong please try again later",
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

  static async me(req, res) {
    const { id } = req.user;
    try {
      const findDietician = await prisma.dietician.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          username: true,
        },
      });
      if (!findDietician) {
        return res.status(400).json({
          message: "Dietician not found for given email",
        });
      }
      return res.json({
        status: 200,
        message: "Dietician found successfully",
        dietician: findDietician,
        role: "dietician",
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        message: "Something went wrong please try again later",
      });
    }
  }

  static async getAll(req, res) {
    try {
      const findDietician = await prisma.dietician.findMany();
      if (!findDietician) {
        return res.status(400).json({
          message: "No dietician found",
        });
      }
      return res.status(200).json({
        dietician: findDietician.map(({ password, ...e }) => e),
        role: "dietician",
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        message: "Something went wrong please try again later",
      });
    }
  }

  static async getById(req, res) {
    const { id } = req.params;
    try {
      const findDietician = await prisma.dietician.findUnique({
        where: { id: id },
      });
      if (!findDietician) {
        return res.status(400).json({
          message: "No dietician found",
        });
      }
      const { password, ...all } = findDietician;
      return res.json({
        ...all,
        role: "dietician",
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        message: "Something went wrong please try again later",
      });
    }
  }

  static async update(req, res) {
    const { id, role } = req.user;
    const updateData = req.body;
    if (role !== "dietician")
      return res.status(400).json({ message: "Only for dieticians." });
    try {
      const updatedDietician = await prisma.dietician.update({
        where: {
          id: id,
        },
        data: updateData,
      });
      if (!updatedDietician) throw new Error();
      const { password, ...all } = updatedDietician;

      return res.status(201).json({
        message: "Dietician updated successfully",
        dietician: all,
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: `Something went wrong!` });
    }
  }
  static async updateById(req, res) {
    const { id } = req.params;
    const updateData = req.body;
    try {
      const updatedDietician = await prisma.dietician.update({
        where: {
          id: id,
        },
        data: updateData,
      });
      if (!updatedDietician) throw new Error();
      const { password, ...all } = updatedDietician;

      return res.status(201).json({
        message: "Dietician updated successfully",
        dietician: all,
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: `Something went wrong!` });
    }
  }
  static async deleteDietician(req, res) {
    try {
      const { id } = req.params;

      // Delete the dietician
      const dietician = await prisma.dietician.delete({
        where: {
          id: id,
        },
      });

      return res.status(201).json({
        message: "Dietician deleted successfully",
        dietician: dietician,
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: `Something went wrong!` });
    }
  }
}

export default DieticianAuthController;
