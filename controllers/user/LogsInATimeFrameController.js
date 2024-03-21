import { format } from "date-fns";
import prisma from "../../db/db.config.js";
import waterLogController from "../water/waterLogController.js";
import {
  formatDate,
  getDateRange,
  findNearestTime,
} from "../../helpers/dateValidate.js";
import { getBMI, lbsToKg, convertFtToCm } from "../../helpers/unitConverter.js";

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
            // finished: true,
          },
          include: {
            meal: {
              include: {
                nutrition: true,
              },
            },
          },
        });
        console.log(logs);
        let sum = 0;

        for (const log of logs) {
          if (logs.meal?.nutrition)
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

  static getDashboard = async (req, res) => {
    try {
      const { id } = req.user;
      const formatString = "EEEE dd MMM";

      const date = formatDate(new Date());
      const userId = id;
      const formattedDate = format(date, formatString);

      // Get user

      const getUser = await prisma.user.findFirst({
        where: {
          id: userId,
        },
      });

      if (!getUser) return res.status(401).json({ message: "User not found" });

      let { height, height_unit, weight, weight_unit } = getUser;

      if (height_unit == "ft") height = convertFtToCm(height);
      if (weight_unit == "lbs") weight = lbsToKg(weight);

      const bmi = getBMI(weight, height / 100);

      // daily water intake
      const fetchTodayWater = await prisma.waterLog.findFirst({
        where: {
          userId,
          date,
        },
        include: {
          waterIntakes: true, // Include associated water intakes
        },
      });

      const waterDetails = fetchTodayWater
        ? {
            totalAmount: fetchTodayWater.totalAmount,
            waterIntakes: fetchTodayWater.waterIntakes,
          }
        : {
            totalAmount: 0,
            waterIntakes: [],
          };

      // daily steps log
      const stepLog = await prisma.stepLog.findFirst({
        where: {
          userId,
          date,
        },
        include: {
          stepIntakes: true, // Include associated step intakes
        },
      });

      const totalSteps = stepLog ? stepLog.totalSteps : 0;

      // get medicine
      const medicineLog = await prisma.medicine.findMany({
        where: {
          userId: userId,
          date,
        },
      });

      const medicine = findNearestTime(medicineLog);

      // get Meals
      const mealLog = await prisma.userWithMeals.findMany({
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
      const { startDate, endDate } = getDateRange(7, new Date());

      const weightLogs = await prisma.weightLog.findMany({
        where: {
          userId,
          createdAt: {
            gte: new Date(startDate).toISOString(), // Ensure ISO-8601 format
            lte: new Date(endDate).toISOString(), // Ensure ISO-8601 format
          },
        },
      });

      const sleepDate = getDateRange(2, new Date());

      const sleepLog = await prisma.sleepLog.findFirst({
        where: {
          userId,
          date: sleepDate.startDate,
        },
      });
      let totalSleepMinutes = 0;

      if (sleepLog) {
        totalSleepMinutes = sleepLog.totalSleep;
      }

      let calories = {
        taken: 0,
        left: 0,
      };
      if (mealLog.length > 0) {
        for (const meals of mealLog) {
          if (meals.finished) {
            if (meals.meal?.nutrition)
              calories.taken += meals.meal.nutrition[0]?.cal;
          } else {
            if (meals.meal?.nutrition)
              calories.left += meals.meal.nutrition[0]?.cal;
          }
        }
      }

      return res.status(200).json({
        date: formattedDate,
        name: getUser.name,
        user: { ...getUser },
        target: {
          water: getUser.water_target,
          sleep: getUser.sleep_target,
          step: getUser.step_target,
          calories: getUser.calories_target,
        },
        calories,
        bmi,
        steps: totalSteps,
        medicine: medicine,
        waterIntake: waterDetails,
        sleepMinutes: totalSleepMinutes,
        meals: mealLog,
        weight: weightLogs,
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}

export default GetLogs;
