import prisma from "../../db/db.config.js";
import bcrypt from "bcryptjs";

import {
  validatorCompile,
  dieticianLoginSchema,
} from "../../validations/authValidation.js";
import { generateToken } from "../../helpers/privacy.js";

export default class genericAuth {
  static login = async (req, res) => {
    try {
      const body = req.body;
      const validator = await validatorCompile(dieticianLoginSchema, body);
      if (validator.error)
        return res.status(401).json({ message: validator.error });

      const dietician = await prisma.dietician.findUnique({
        where: {
          email: validator.email,
        },
      });

      if (dietician) {
        if (!bcrypt.compareSync(validator.password, dietician.password)) {
          return res.status(400).json({
            errors: {
              password: "Invalid Credentials.",
            },
          });
        }
        const { password, ...all } = dietician;
        return res.status(200).json({
          ...all,
          role: "dietician",
          token: await generateToken({ ...dietician, role: "dietician" }),
        });
      }

      const admin = await prisma.admin.findUnique({
        where: {
          email: validator.email,
        },
      });

      if (admin) {
        if (!bcrypt.compareSync(validator.password, admin.password)) {
          return res.status(400).json({
            message: "Invalid email or password.",
          });
        }
        const { password, ...all } = admin;
        return res.status(200).json({
          ...all,
          role: "admin",
          token: await generateToken({ ...admin, role: "admin" }),
        });
      }

      return res.status(404).json({ message: "Invalid email or password." });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}
