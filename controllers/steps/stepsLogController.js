import { eachWeekOfInterval, format, isWithinInterval } from "date-fns";
import prisma from "../../db/db.config.js";
import {
  getDateRange,
  isValidObjectId,
  validDate,
} from "../../helpers/dateValidate.js";

class StepsLogController {
  static async getStepsLog(req, res) {
    try {
      const { userId, date } = req.params;

      // Fetch the step log for the specified user and date
      const stepLog = await prisma.stepLog.findFirst({
        where: {
          userId,
          date,
        },
        include: {
          stepIntakes: true, // Include associated step intakes
        },
      });

      if (!stepLog) {
        return res.status(404).json({
          error: "Step log not found for the specified user and date",
        });
      }

      res.json(stepLog);
    } catch (error) {
      console.error("Error retrieving step log:", error);
      res.status(500).json({ error: "Failed to retrieve step log" });
    }
  }

  static getUserStepProgress = async (req, res) => {
    try {
      const user = req.user;
      const date = req.query.date;
      if (user.role == "admin" || user.role == "dietician") {
        if (!isValidObjectId(req.params.id)) {
          return res.status(400).json({ message: "Invalid user id" });
        }
        user.id = req.params.id;
      }
      if (!date)
        return res.status(400).json({
          message: "Date not found",
        });
      const findMixAndMax = (data) => {
        const values = data.map((obj) => obj.totalSteps);
        let minSteps = Math.min(...values);
        let maxSteps = Math.max(...values);

        return {
          minSteps,
          maxSteps,
        };
      };
      function parseWeekData(date) {
        const dateToWeek = (date) => format(date, "EEEE");
        const totalSteps = {
          Monday: 0,
          Tuesday: 0,
          Wednesday: 0,
          Thursday: 0,
          Friday: 0,
          Saturday: 0,
          Sunday: 0,
        };
        date.forEach((day) => {
          const parseDate = dateToWeek(new Date(day.date));
          totalSteps[parseDate] += day.totalSteps;
        });
        const week = Object.entries(totalSteps).map(([day, totalSteps]) => {
          return { day: day, totalSteps: totalSteps };
        });
        const todayIndex = ((new Date().getDay() + 6) % 7) - 6;
        const rotatedArr = [
          ...week.slice(todayIndex),
          ...week.slice(0, todayIndex),
        ];
        return rotatedArr;
      }

      const parseMonthData = (graph, { start, end }) => {
        const weeks = eachWeekOfInterval({
          start,
          end,
        });
        const parseWeeks = weeks.map((i, n) => {
          return { week: i, totalSteps: 0 };
        });

        graph.map((e) => {
          for (let i = 0; i < parseWeeks.length; i++) {
            if (i == parseWeeks.length - 1) {
              if (
                isWithinInterval(e.date, {
                  start: parseWeeks[i].week,
                  end,
                })
              ) {
                parseWeeks[i].totalSteps += e.totalSteps;
                break;
              }
            }
            if (
              isWithinInterval(e.date, {
                start: parseWeeks[i].week,
                end: parseWeeks[i + 1].week,
              })
            ) {
              parseWeeks[i].totalSteps += e.totalSteps;
              break;
            }
          }
        });
        return parseWeeks;
      };

      const parseYear = (data) => {
        const dateToMonth = (date) => format(date, "LLLL");
        const yearlyData = {
          January: 0,
          February: 0,
          March: 0,
          April: 0,
          May: 0,
          June: 0,
          July: 0,
          August: 0,
          September: 0,
          October: 0,
          November: 0,
          December: 0,
        };

        data.forEach((day) => {
          const parseDate = dateToMonth(day.date);
          yearlyData[parseDate] += day.totalSteps;
        });
        const month = Object.entries(yearlyData).map(([day, totalSteps]) => {
          return { month: day, totalSteps: totalSteps };
        });

        const currentMonthIndex = new Date().getMonth();
        const monthsToRotate = 1 + currentMonthIndex;
        const rotatedArr = [
          ...month.slice(monthsToRotate),
          ...month.slice(0, monthsToRotate),
        ];

        return rotatedArr;
      };

      const queryData = async (days, currentDate) => {
        const { startDate, endDate } = getDateRange(days, currentDate);
        const userSteps = await prisma.stepLog.findMany({
          where: {
            userId: user.id,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            totalSteps: true,
            date: true,
          },
        });

        return userSteps;
      };

      switch (date) {
        case "weekly":
          const week = await queryData(7, new Date());
          const data = parseWeekData(week);
          let minMax = findMixAndMax(data);
          return res.status(200).json({ minMax, graph: data });
          break;
        case "monthly":
          const graph = await queryData(31, new Date());
          const { startDate, endDate } = getDateRange(31, new Date());
          const monthly = parseMonthData(graph, {
            start: startDate,
            end: endDate,
          });
          const monthlyMinMax = findMixAndMax(monthly);
          return res
            .status(200)
            .json({ minMax: monthlyMinMax, graph: monthly });
          break;
        case "yearly":
          const yearly = await queryData(365, new Date());
          const yearlyData = parseYear(yearly);
          const yearlyMinMax = findMixAndMax(yearlyData);
          return res
            .status(200)
            .json({ minMax: yearlyMinMax, graph: yearlyData });
          break;

        default:
          return res.status(400).json({
            message:
              "Date not validated, it must be type of date in weekly, monthly, yearly",
          });
      }
    } catch (error) {
      console.error("Error retrieving step log:", error);
      res
        .status(500)
        .json({ error: "Failed to retrieve step log, Internal server error" });
    }
  };
}

export default StepsLogController;
