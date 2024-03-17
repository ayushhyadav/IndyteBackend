import prisma from "../../db/db.config.js";
import bcrypt from "bcryptjs";
import { sendOTP } from "../otpController.js";

import {
  dieticianRegisterSchema,
  dieticianLoginSchema,
  dieticianUpdateSchema,
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

        const { password, ...all } = findDietician;

        return res.json({
          ...all,
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
    try {
      const { phone } = req.body;
      if (!phone)
        return res.status(404).json({ message: "phone number required" });
      const findDietician = await prisma.dietician.findUnique({
        where: {
          phone,
        },
      });
      if (!findDietician) {
        return res.status(400).json({
          message: "Dietician not found for given phone number.",
        });
      }
      const otp = await sendOTP(phone);
      if (otp.error)
        return res.status(400).json({ message: "Internal Server Error" });
      return res.status(200).json({
        message: "OTP sent successfully",
      });
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
      });
      if (!findDietician) {
        return res.status(400).json({
          message: "Dietician not found for given email",
        });
      }
      const { password, ...all } = findDietician;
      return res.status(200).json({
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
    try {
      const { id } = req.params;
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
    try {
      const { id, role } = req.user;
      const validator = await validatorCompile(dieticianUpdateSchema, req.body);
      if (!validator)
        return res.status(401).json({ message: "Invalid update request" });
      if (role !== "dietician")
        return res.status(400).json({ message: "Only for dieticians." });

      const updatedDietician = await prisma.dietician.update({
        where: {
          id: id,
        },
        data: validator,
      });
      if (!updatedDietician)
        return res
          .status(404)
          .json({ message: "No dietician found for the id" });

      const { password, ...all } = updatedDietician;

      return res.status(201).json({
        message: "Dietician updated successfully",
        ...all,
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: `Something went wrong!` });
    }
  }
  static async updateById(req, res) {
    try {
      const { id } = req.params;
      const validator = await validatorCompile(dieticianUpdateSchema, req.body);
      if (!validator)
        return res.status(401).json({ message: "Invalid update request" });

      const dieticianSearch = await prisma.dietician.findUnique({
        where: { id: id },
        select: {
          id: true,
        },
      });

      if (!dieticianSearch)
        return res
          .status(404)
          .json({ message: "No dietician found for the id" });

      const updatedDietician = await prisma.dietician.update({
        where: {
          id: id,
        },
        data: validator,
      });

      const { password, ...all } = updatedDietician;

      return res.status(201).json({
        message: "Dietician updated successfully",
        ...all,
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: `Something went wrong!` });
    }
  }
  static async deleteDietician(req, res) {
    try {
      const { id } = req.params;
      if (!id)
        return res.status(404).json({ message: "Dietician id not found" });

      const checkDietician = await prisma.dietician.findUnique({
        where: { id: id },
      });
      if (!checkDietician)
        return res.status(404).json({ message: "Dietician not found" });

      // Delete the dietician
      const dietician = await prisma.dietician.delete({
        where: {
          id: id,
        },
      });

      return res.status(201).json({
        message: "Dietician deleted successfully",
        ...dietician,
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: `Something went wrong!` });
    }
  }
}

export default DieticianAuthController;
