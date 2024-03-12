import prisma from "../../db/db.config.js";
const months = {
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  aug: "08",
  sep: "09",
  oct: "10",
  nov: "11",
  dec: "12",
};
class GetLogs {
  static async GetLogsByMonth(req, res) {
    const { userId, year } = req.query;
    try {
      const userWithMeals = await prisma.userWithMeals.findFirst({
        where: {
          userId,
        },
      });

      if (!userWithMeals) {
        return res.status(400).json({
          status: 400,
          message: "Meals don't exist for the given user",
        });
      }

      const monthlyLogs = {};
      for (const monthKey of Object.keys(months)) {
        const month = months[monthKey];

        console.log(year + "-" + month, userWithMeals.id);
        const logs = await prisma.userWithMeals.findMany({
          where: {
            userId,
            date: {
              startsWith: year + "-" + month,
            },
            finished: true,
          },
          select: {
            meal: {
              select: {
                nutrition: true,
              },
            },
          },
        });

        let sum = 0;

        for (const log of logs) {
          for (const meal of log.meal.nutrition) {
            sum += meal.cal;
          }
        }

        // Assign sum of nutrition to corresponding month key
        monthlyLogs[monthKey] = sum;
      }

      res.status(200).json({
        message: "Logs fetched successfully",
        totalCalories: monthlyLogs,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Something went wrong. Please try again later",
        status: 500,
      });
    }
  }
}

export default GetLogs;
