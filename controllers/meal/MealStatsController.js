import prisma from "../../db/db.config.js";

class MealStatsController {
  // Controller to get the stats of finished and not finished meals of all times
  // Controller to get the stats of finished and not finished meals of all times
  static async getMealStats(req, res) {
    try {
      // Calculate the count of total meals
      const totalStats = await prisma.userWithMeals.aggregate({
        _count: true,
      });

      // Calculate the count of finished meals
      const finishedStats = await prisma.userWithMeals.aggregate({
        where: {
          finished: true,
        },
        _count: true,
      });

      // Calculate the count of not finished meals
      const notFinishedStats = totalStats._count - finishedStats._count;

      // Return the statistics as a response
      return res.status(200).json({
        status: 200,
        message: "Meal statistics",
        data: {
          totalMeals: totalStats._count,
          finishedMeals: finishedStats._count,
          notFinishedMeals: notFinishedStats,
        },
      });
    } catch (error) {
      console.error("Error fetching meal statistics:", error);
      return res.status(500).json({
        message: "Something went wrong. Please try again later.",
      });
    }
  }

  // Controller to get all-time data including meal name, assigned user, dietitian assigned to the user, meal status, time of day, and date
  static async getAllTimeData(req, res) {
    try {
      const { page = 1, perPage = 10 } = req.query; // Default page is 1 and perPage is 10
      const offset = (page - 1) * perPage;

      const allTimeData = await prisma.userWithMeals.findMany({
        select: {
          userId: true,
          mealId: true,
          mealTime: true,
          date: true,
          quantity: true,
          finished: true,
          meal: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              name: true,
              dietician: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        skip: offset,
        take: perPage,
      });

      // Return the paginated data as a response
      return res.status(200).json({
        status: 200,
        message: "All-time data",
        data: allTimeData,
      });
    } catch (error) {
      console.error("Error fetching all-time data:", error);
      return res.status(500).json({
        message: "Something went wrong. Please try again later.",
      });
    }
  }
}

export default MealStatsController;
