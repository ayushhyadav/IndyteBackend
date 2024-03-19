import prisma from "../db/db.config.js";
import bcrypt from "bcryptjs";

class DeiticianProfileController {
  static async register(req, res) {
    try {
      const body = req.body;

      //   * Check if email exist
      const findDietician = await prisma.dietician.findUnique({
        where: {
          email: body.email,
        },
      });

      if (findDietician) {
        return res.status(400).json({
          errors: {
            phone: " email already taken.please use another one.",
          },
        });
      }
      //   * Encrypt the password
      const salt = bcrypt.genSaltSync(10);
      body.password = bcrypt.hashSync(body.password, salt);
      // return res.json({payload})

      const dietician = await prisma.dietician.create({
        data: body,
      });
      return res.json({
        status: 200,
        message: "Dietician created successfully",
        dietician,
      });
    } catch (error) {
      console.log("The error is", error);
      return res.status(400).json({ error: error.message });
    }
  }

  static async index(req, res) {
    try {
      const dieticians = await prisma.dietician.findMany();
      return res.json({ status: 200, dieticians });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Something went wrong! ${error}` });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;

      const dietician = await prisma.dietician.findFirst({
        where: {
          id: id,
        },
      });

      return res.json({
        status: 200,
        message: "got a dietician!",
        dietician,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Something went wrong! ${error}` });
    }
  }

  static async updateById(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body; // Data to update

      // Check if the dietician exists
      const dietician = await prisma.dietician.findUnique({
        where: {
          id: id,
        },
      });

      if (!dietician) {
        return res.status(404).json({ message: "Dietician not found" });
      }

      // Update the dietician with the provided data
      const updatedDietician = await prisma.dietician.update({
        where: {
          id: id,
        },
        data: updateData,
      });

      return res.json({
        status: 200,
        message: "Dietician updated successfully",
        dietician: updatedDietician,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Something went wrong! ${error}` });
    }
  }

  static async deleteById(req, res) {
    try {
      const { id } = req.params;

      // Check if the dietician exists
      const dietician = await prisma.dietician.findUnique({
        where: {
          id: id,
        },
      });

      if (!dietician) {
        return res.status(404).json({ message: "Dietician not found" });
      }

      // Delete the dietician
      await prisma.dietician.delete({
        where: {
          id: id,
        },
      });

      return res.json({
        status: 200,
        message: "Dietician deleted successfully",
        dietician: dietician,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Something went wrong! ${error}` });
    }
  }
}

export default DeiticianProfileController;
