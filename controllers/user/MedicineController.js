import prisma from "../../db/db.config.js";

class MedicineController {
  static async createMedicine(req, res) {
    const { userId, name, quantity, date, beforeOrAfterMeal, time, medType } =
      req.body;

    try {
      console.log(
        userId,
        name,
        quantity,
        date,
        beforeOrAfterMeal,
        time,
        medType
      );
      if (
        !userId ||
        !name ||
        !quantity ||
        !date ||
        !beforeOrAfterMeal ||
        !time ||
        !medType
      ) {
        return res.status(400).json({
          status: 400,
          message: "Please provide user id, name, quantity, time and date.",
        });
      }

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        return res.status(400).json({
          status: 400,
          message: "User doesnt exist",
        });
      }

      const createMedicine = await prisma.medicine.create({
        data: {
          userId,
          name,
          quantity,
          date,
          beforeOrAfterMeal,
          time,
          medType,
        },
      });

      return res.json({
        status: 200,
        message: "Medicine created successfully",
        data: createMedicine,
      });
    } catch (error) {
      console.log("The error is", error);
      res.status(500).json({
        status: 500,
        message: "Something went wrong.Please try again.",
      });
    }
  }

  static async markMedicineAsTaken(req, res) {
    const { userId, medicineId } = req.body;
    try {
      if (!medicineId) {
        return res.status(400).json({
          status: 400,
          message: "Please provide medicine id.",
        });
      }

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        return res.status(400).json({
          status: 400,
          message: "User doesnt exist",
        });
      }

      const medicine = await prisma.medicine.findUnique({
        where: {
          id: medicineId,
        },
      });

      if (!medicine) {
        return res.status(400).json({
          status: 400,
          message: "Medicine doesnt exist",
        });
      }

      const markMedicine = await prisma.medicine.update({
        where: {
          id: medicineId,
        },
        data: {
          finished: true,
        },
      });

      return res.json({
        status: 200,
        message: "Medicine marked as taken successfully",
        data: markMedicine,
      });
    } catch (error) {
      console.log("The error is", error);
      res.status(500).json({
        status: 500,
        message: "Something went wrong.Please try again.",
      });
    }
  }

  static async getMedicinesForDateAndUser(req, res) {
    const { userId, date } = req.query;

    try {
      if (!userId || !date) {
        return res.status(400).json({
          status: 400,
          message: "Please provide user ID and date.",
        });
      }

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        return res.status(400).json({
          status: 400,
          message: "User doesn't exist.",
        });
      }

      const medicines = await prisma.medicine.findMany({
        where: {
          userId: userId,
          date: date,
        },
      });

      return res.status(200).json({
        status: 200,
        message: "Medicines fetched successfully",
        data: medicines,
      });
    } catch (error) {
      console.error("Error fetching medicines:", error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong. Please try again later.",
      });
    }
  }
}

export default MedicineController;
