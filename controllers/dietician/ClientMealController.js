import prisma from "../../db/db.config.js";

class ClientMealController {
  static async assignMeal(req, res) {
    try {
      const { mealId, userId, date, mealTime, quantity } = req.body;
      if (!mealId || !userId) {
        return res.status(400).json({
          status: 400,
          message: "Please provide meal id and user id.",
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

      const meal = await prisma.meal.findUnique({
        where: {
          id: mealId,
        },
      });

      if (!meal) {
        return res.status(400).json({
          status: 400,
          message: "meal doesnt exist",
        });
      }

      const alreadyAssigned = await prisma.userWithMeals.findFirst({
        where: {
          userId,
          mealId,
          date,
          mealTime,
        },
      });

      if (alreadyAssigned) {
        return res.status(400).json({
          status: 400,
          message: "Meal already assigned to this user.",
        });
      }

      const assignMeal = await prisma.userWithMeals.create({
        data: {
          userId,
          mealId,
          date,
          mealTime,
          quantity,
        },
      });

      return res.status(200).json({
        status: 200,
        message: "Meal assigned successfully.",
        data: assignMeal,
      });
    } catch (error) {
      console.log("The error is", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return res.status(400).json({
          status: 400,
          message: "Meal already assigned to this user.",
        });
      } else {
        return res.status(500).json({
          status: 500,
          message: "Something went wrong.Please try again.",
        });
      }
    }
  }

  static async getUserMeals(req, res) {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({
          status: 400,
          message: "Please provide user id.",
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
          message: "User not found.",
        });
      }
      const userMeals = await prisma.userWithMeals.findMany({
        where: {
          userId,
        },
        include: {
          meal: {
            include: {
              nutrition: true,
            },
          },
        },
      });
      return res.status(200).json({
        status: 200,
        message: "User meals fetched successfully.",
        data: userMeals,
      });
    } catch (error) {
      console.log("The error is", error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong.Please try again.",
      });
    }
  }

  static async getUserMealsForADate(req, res) {
    try {
      const { userId, date } = req.query;
      if (!userId) {
        return res.status(400).json({
          status: 400,
          message: "Please provide user id.",
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
          message: "User not found.",
        });
      }
      const userMeals = await prisma.userWithMeals.findMany({
        where: {
          userId,
          date,
        },
        include: {
          meal: {
            include: {
              nutrition: true,
            },
          },
        },
      });
      // here
      return res.status(200).json({
        status: 200,
        message: "User meals fetched successfully.",
        data: userMeals,
      });
    } catch (error) {
      console.log("The error is", error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong.Please try again.",
      });
    }
  }

  static async unassignMeal(req, res) {
    const { mealId, userId, date, mealTime } = req.body;
    try {
      if (!mealId || !userId || !date || !mealTime) {
        return res.status(400).json({
          status: 400,
          message:
            "Please provide meal id, user id, day of week and meal time.",
        });
      }

      const userWithMeals = await prisma.userWithMeals.findUnique({
        where: {
          userId_mealId_date_mealTime: {
            userId,
            mealId,
            date,
            mealTime,
          },
        },
      });

      if (!userWithMeals) {
        return res.status(400).json({
          status: 400,
          message: "Meal not assigned to this user.",
        });
      }

      const unassignMeal = await prisma.userWithMeals.delete({
        where: {
          id: userWithMeals.id,
        },
      });

      return res.status(200).json({
        status: 200,
        message: "Meal unassigned successfully.",
        data: unassignMeal,
      });
    } catch (error) {
      console.log("The error is", error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong.Please try again.",
      });
    }
  }
}

export default ClientMealController;
