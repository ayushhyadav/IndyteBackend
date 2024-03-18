import prisma from "../../db/db.config.js";
import { validDate, getDateRange } from "../../helpers/dateValidate.js";
import {
  subWeeks,
  startOfWeek,
  endOfWeek,
  format,
  startOfMonth,
  endOfMonth,
  endOfDay,
  startOfDay,
  subDays,
} from "date-fns";

class ProgressTracker {
  //workout progress

  static getUserWorkoutProgress = async (req, res) => {
    const user = req.user;
    const date = req.query.date;

    try {
      if (!date)
        return res.status(400).json({
          message: "Date not found",
        });

      const parseData = (userWorkouts, time) => {
        let targetCalories = 0;
        let burntCalories = 0;
        let finishedWorkouts = 0;
        let unfinishedWorkouts = 0;
        let totalWorkout = 0;

        if (!userWorkouts.length > 0) {
          return res.status(400).json({
            message: "User workouts not found for the current " + time,
            data: {
              targetCalories,
              burntCalories,
              finishedWorkouts,
              unfinishedWorkouts,
              totalWorkout,
            },
          });
        }

        for (const userWorkout of userWorkouts) {
          if (userWorkout.finished) {
            burntCalories += userWorkout.workout.totalCaloriesBurnt;
            finishedWorkouts += 1;
          } else {
            unfinishedWorkouts += 1;
          }
          targetCalories += userWorkout.workout.totalCaloriesBurnt;
        }

        return res.status(200).json({
          status: 200,
          message: "User workouts found for the current " + time,
          data: {
            targetCalories,
            burntCalories,
            finishedWorkouts,
            unfinishedWorkouts,
            totalWorkout: finishedWorkouts + unfinishedWorkouts,
          },
        });
      };

      const queryData = async (days, currentDate) => {
        const { startDate, endDate } = getDateRange(days, currentDate);

        const userWorkouts = await prisma.userWithWorkout.findMany({
          where: {
            userId: user.id,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            workout: true,
          },
        });
        parseData(userWorkouts, date);
      };

      let yearRegex = /\b\d{4}\b/;
      const yearlyData = async (year) => {
        const yearlyProgress = [];
        if (yearRegex.test(year)) {
          for (let month = 1; month < 13; month++) {
            const { startDate, endDate } = getDateRange(
              30,
              new Date(year, month)
            );

            // Retrieve user workouts within the current month
            const userWorkouts = await prisma.userWithWorkout.findMany({
              where: {
                userId: user.id,
                date: {
                  gte: startDate,
                  lte: endDate,
                },
              },
              include: {
                workout: true,
              },
            });

            let targetCalories = 0;
            let burntCalories = 0;
            let finishedWorkouts = 0;
            let unfinishedWorkouts = 0;

            for (const userWorkout of userWorkouts) {
              if (userWorkout.finished) {
                burntCalories += userWorkout.workout.totalCaloriesBurnt;
                finishedWorkouts += 1;
              } else {
                unfinishedWorkouts += 1;
              }
              targetCalories += userWorkout.workout.totalCaloriesBurnt;
            }

            // Add progress data for the current month to the yearlyProgress array
            yearlyProgress.push({
              month: month, // Month index starts from 0, so add 1 to make it human-readable
              year: parseInt(year),
              targetCalories,
              burntCalories,
              finishedWorkouts,
              unfinishedWorkouts,
              totalWorkouts: finishedWorkouts + unfinishedWorkouts,
            });
          }
        }
        return yearlyProgress;
      };
      if (yearRegex.test(date)) {
        const yearlyProgress = await yearlyData(new Date(date).getFullYear());
        return res.status(201).json(yearlyProgress);
      } else if (validDate(date)) {
        await queryData(1, new Date(date));
      } else {
        switch (date) {
          case "weekly":
            await queryData(7, new Date());
            break;
          case "monthly":
            await queryData(31, new Date());
            break;
          case "yearly":
            const yearlyProgress = await yearlyData(new Date().getFullYear());
            return res.status(201).json(yearlyProgress);
          case "alltime":
            await queryData(365 * 5, new Date());
            break;

          default:
            return res.status(400).json({
              message:
                "Date not validated, it must be type of date in YYYY-MM-DD, weekly, monthly, yearly or alltime",
            });
        }
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "internal server error" });
    }
  };

  static async getDailyWorkoutProgress(req, res) {
    const { userId, date } = req.query;
    if (!userId || !date) {
      return res.status(400).json({
        status: 400,
        message: "Please provide user id and date.",
      });
    }
    try {
      const userWorkouts = await prisma.userWithWorkout.findMany({
        where: {
          userId,
          date,
        },
        include: {
          workout: true,
        },
      });
      if (!userWorkouts) {
        return res.status(400).json({
          status: 400,
          message: "User workout not found",
        });
      }

      let targetCalories = 0;
      let burntCalories = 0;

      let finishedWorkouts = 0;
      let unfinishedWorkouts = 0;

      console.log(userWorkouts);

      for (const userWorkout of userWorkouts) {
        if (userWorkout.finished) {
          burntCalories += userWorkout.workout.totalCaloriesBurnt;
          targetCalories += userWorkout.workout.totalCaloriesBurnt;
          finishedWorkouts += 1;
        } else {
          targetCalories += userWorkout.workout.totalCaloriesBurnt;
          unfinishedWorkouts += 1;
        }
      }
      return res.json({
        status: 200,
        message: "User workouts found",
        data: {
          targetCalories,
          burntCalories,
          finishedWorkouts,
          unfinishedWorkouts,
        },
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Something went wrong! ${error}` });
    }
  }

  static async getLastWeekWorkoutProgress(req, res) {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({
        status: 400,
        message: "Please provide user id.",
      });
    }
    try {
      // Calculate the start and end dates for last week
      const currentDate = new Date();
      const lastWeekStartDate = format(
        startOfDay(subDays(currentDate, 6)),
        "yyyy-MM-dd"
      );
      const lastWeekEndDate = format(endOfDay(currentDate, 1), "yyyy-MM-dd");

      console.log(lastWeekStartDate, lastWeekEndDate);

      const userWorkouts = await prisma.userWithWorkout.findMany({
        where: {
          userId,
          date: {
            gte: lastWeekStartDate,
            lte: lastWeekEndDate,
          },
        },
        include: {
          workout: true,
        },
      });
      if (!userWorkouts) {
        return res.status(400).json({
          status: 400,
          message: "User workouts not found for last week.",
        });
      }

      let burntCalories = 0;
      let finishedWorkouts = 0;
      let unfinishedWorkouts = 0;

      for (const userWorkout of userWorkouts) {
        if (userWorkout.finished) {
          burntCalories += userWorkout.workout.totalCaloriesBurnt;
          finishedWorkouts += 1;
        } else {
          unfinishedWorkouts += 1;
        }
      }

      return res.json({
        status: 200,
        message: "User workouts found for last week.",
        data: {
          burntCalories,
          finishedWorkouts,
          unfinishedWorkouts,
          userWorkouts,
        },
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Something went wrong! ${error}` });
    }
  }

  static async getCurrentMonthWorkoutProgress(req, res) {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({
        status: 400,
        message: "Please provide user id.",
      });
    }
    try {
      // Calculate the start and end dates for the current month
      const currentDate = new Date();
      const currentMonthStartDate = format(
        startOfMonth(currentDate),
        "yyyy-MM-dd"
      );
      const currentMonthEndDate = format(endOfMonth(currentDate), "yyyy-MM-dd");

      const userWorkouts = await prisma.userWithWorkout.findMany({
        where: {
          userId,
          date: {
            gte: currentMonthStartDate,
            lte: currentMonthEndDate,
          },
        },
        include: {
          workout: true,
        },
      });
      if (!userWorkouts) {
        return res.status(400).json({
          status: 400,
          message: "User workouts not found for the current month.",
        });
      }

      console.log(userWorkouts);

      let targetCalories = 0;
      let burntCalories = 0;
      let finishedWorkouts = 0;
      let unfinishedWorkouts = 0;

      for (const userWorkout of userWorkouts) {
        if (userWorkout.finished) {
          burntCalories += userWorkout.workout.totalCaloriesBurnt;
          finishedWorkouts += 1;
        } else {
          unfinishedWorkouts += 1;
        }
        targetCalories += userWorkout.workout.totalCaloriesBurnt;
      }

      return res.json({
        status: 200,
        message: "User workouts found for the current month.",
        data: {
          targetCalories,
          burntCalories,
          finishedWorkouts,
          unfinishedWorkouts,
        },
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Something went wrong! ${error}` });
    }
  }

  static async getYearlyWorkoutProgress(req, res) {
    const { userId, year } = req.query;
    if (!userId || !year) {
      return res.status(400).json({
        status: 400,
        message: "Please provide user id and year.",
      });
    }
    try {
      const yearlyProgress = [];

      // Loop through each month in the year
      for (let month = 0; month < 12; month++) {
        // Calculate the start and end dates for the current month
        const startDate = format(
          startOfMonth(new Date(year, month)),
          "yyyy-MM-dd"
        );
        const endDate = format(endOfMonth(new Date(year, month)), "yyyy-MM-dd");

        // Retrieve user workouts within the current month
        const userWorkouts = await prisma.userWithWorkout.findMany({
          where: {
            userId,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            workout: true,
          },
        });

        // Calculate progress for the current month
        let targetCalories = 0;
        let burntCalories = 0;
        let finishedWorkouts = 0;
        let unfinishedWorkouts = 0;

        for (const userWorkout of userWorkouts) {
          if (userWorkout.finished) {
            burntCalories += userWorkout.workout.totalCaloriesBurnt;
            finishedWorkouts += 1;
          } else {
            unfinishedWorkouts += 1;
          }
          targetCalories += userWorkout.workout.totalCaloriesBurnt;
        }

        // Add progress data for the current month to the yearlyProgress array
        yearlyProgress.push({
          month: month + 1, // Month index starts from 0, so add 1 to make it human-readable
          year: parseInt(year),
          targetCalories,
          burntCalories,
          finishedWorkouts,
          unfinishedWorkouts,
        });
      }

      return res.json({
        status: 200,
        message: "Yearly workout progress calculated successfully.",
        data: yearlyProgress,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Something went wrong! ${error}` });
    }
  }

  //diet progress

  static async DailyDietProgress(req, res) {
    const { userId, date } = req.query;

    try {
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

      let totalCalories = 0;
      let consumedCalories = 0;
      let totalCarbs = 0;
      let totalProtein = 0;
      let totalFats = 0;
      let completedMeals = 0;
      let incompleteMeals = 0;

      for (const userMeal of userMeals) {
        if (userMeal.finished) {
          completedMeals += 1;
          consumedCalories += userMeal.meal.nutrition[0].cal;
          totalCarbs += userMeal.meal.nutrition[0].carbs;
          totalFats += userMeal.meal.nutrition[0].fats;
          totalProtein += userMeal.meal.nutrition[0].protein;
        } else {
          totalCalories += userMeal.meal.nutrition[0].cal;
          incompleteMeals += 1;
        }
      }

      return res.status(200).json({
        status: 200,
        message: "User meals fetched successfully.",
        data: {
          totalCalories,
          consumedCalories,
          totalCarbs,
          totalProtein,
          totalFats,
          completedMeals,
          incompleteMeals,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Something went wrong.Please try again.",
      });
    }
  }

  static async LastWeekDietProgress(req, res) {
    const { userId } = req.query;

    try {
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

      const startDate = format(
        startOfDay(subDays(new Date(), 6)),
        "yyyy-MM-dd"
      );
      const endDate = format(endOfDay(new Date(), 1), "yyyy-MM-dd");

      const userMeals = await prisma.userWithMeals.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          meal: {
            include: {
              nutrition: true,
            },
          },
        },
      });

      let consumedCalories = 0;
      let totalCarbs = 0;
      let totalProtein = 0;
      let totalFats = 0;
      let completedMeals = 0;
      let incompleteMeals = 0;

      for (const userMeal of userMeals) {
        if (userMeal.finished) {
          completedMeals += 1;
          consumedCalories += userMeal.meal.nutrition[0].cal;
          totalCarbs += userMeal.meal.nutrition[0].carbs;
          totalFats += userMeal.meal.nutrition[0].fats;
          totalProtein += userMeal.meal.nutrition[0].protein;
        } else {
          incompleteMeals += 1;
        }
      }

      return res.status(200).json({
        status: 200,
        message: "User meals fetched successfully.",
        data: {
          consumedCalories,
          totalCarbs,
          totalProtein,
          totalFats,
          completedMeals,
          incompleteMeals,
          userMeals,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Something went wrong.Please try again.",
      });
    }
  }

  static async getCurrentMonthDietProgress(req, res) {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({
        status: 400,
        message: "Please provide user id.",
      });
    }
    try {
      // Calculate the start and end dates for the current month
      const currentDate = new Date();
      const currentMonthStartDate = format(
        startOfMonth(currentDate),
        "yyyy-MM-dd"
      );
      const currentMonthEndDate = format(endOfMonth(currentDate), "yyyy-MM-dd");

      const userMeals = await prisma.userWithMeals.findMany({
        where: {
          userId,
          date: {
            gte: currentMonthStartDate,
            lte: currentMonthEndDate,
          },
        },
        include: {
          meal: {
            include: {
              nutrition: true,
            },
          },
        },
      });
      if (!userMeals) {
        return res.status(400).json({
          status: 400,
          message: "User workouts not found for the current month.",
        });
      }

      let consumedCalories = 0;
      let totalCarbs = 0;
      let totalProtein = 0;
      let totalFats = 0;
      let completedMeals = 0;
      let incompleteMeals = 0;

      for (const userMeal of userMeals) {
        if (userMeal.finished) {
          completedMeals += 1;
          consumedCalories += userMeal.meal.nutrition[0].cal;
          totalCarbs += userMeal.meal.nutrition[0].carbs;
          totalFats += userMeal.meal.nutrition[0].fats;
          totalProtein += userMeal.meal.nutrition[0].protein;
        } else {
          incompleteMeals += 1;
        }
      }

      return res.status(200).json({
        status: 200,
        message: "User meals fetched successfully.",
        data: {
          consumedCalories,
          totalCarbs,
          totalProtein,
          totalFats,
          completedMeals,
          incompleteMeals,
          userMeals,
        },
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Something went wrong! ${error}` });
    }
  }

  static async getYearlyDietProgress(req, res) {
    const { userId, year } = req.query;
    if (!userId || !year) {
      return res.status(400).json({
        status: 400,
        message: "Please provide user id and year.",
      });
    }
    try {
      const yearlyProgress = [];

      // Loop through each month in the year
      for (let month = 0; month < 12; month++) {
        // Calculate the start and end dates for the current month
        const startDate = format(
          startOfMonth(new Date(year, month)),
          "yyyy-MM-dd"
        );
        const endDate = format(endOfMonth(new Date(year, month)), "yyyy-MM-dd");

        // Retrieve user diets within the current month
        const userDiets = await prisma.userWithMeals.findMany({
          where: {
            userId,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            meal: {
              include: {
                nutrition: true,
              },
            },
          },
        });

        let consumedCalories = 0;
        let totalCarbs = 0;
        let totalProtein = 0;
        let totalFats = 0;
        let completedMeals = 0;
        let incompleteMeals = 0;

        for (const userMeal of userDiets) {
          if (userMeal.finished) {
            completedMeals += 1;
            consumedCalories += userMeal.meal.nutrition[0].cal;
            totalCarbs += userMeal.meal.nutrition[0].carbs;
            totalFats += userMeal.meal.nutrition[0].fats;
            totalProtein += userMeal.meal.nutrition[0].protein;
          } else {
            incompleteMeals += 1;
          }
        }

        // Add progress data for the current month to the yearlyProgress array
        yearlyProgress.push({
          month: month + 1, // Month index starts from 0, so add 1 to make it human-readable
          year: parseInt(year),
          consumedCalories,
          completedMeals,
          incompleteMeals,
        });
      }

      return res.json({
        status: 200,
        message: "Yearly diet progress calculated successfully.",
        data: yearlyProgress,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Something went wrong! ${error}` });
    }
  }

  // water progress

  static async LastWeekWaterProgress(req, res) {
    const { userId } = req.query;

    try {
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

      const startDate = format(
        startOfDay(subDays(new Date(), 6)),
        "yyyy-MM-dd"
      );
      const endDate = format(endOfDay(new Date(), 1), "yyyy-MM-dd");

      const waterLogs = await prisma.waterLog.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      let totalWaterDrunk = 0;

      for (const waterLog of waterLogs) {
        totalWaterDrunk += waterLog.totalAmount;
      }

      return res.status(200).json({
        status: 200,
        message: "Water progress fetched successfully.",
        data: {
          totalWaterDrunk,
        },
      });
    } catch (error) {
      console.error("Error fetching water progress:", error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong. Please try again.",
      });
    }
  }

  static async LastMonthWaterProgress(req, res) {
    const { userId } = req.query;

    try {
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

      // Calculate the start and end dates for the current month
      const currentDate = new Date();
      const startDate = format(startOfMonth(currentDate), "yyyy-MM-dd");
      const endDate = format(endOfMonth(currentDate), "yyyy-MM-dd");

      const waterLogs = await prisma.waterLog.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          waterIntakes: true,
        },
      });

      let totalWaterDrunk = 0;

      for (const waterLog of waterLogs) {
        totalWaterDrunk += waterLog.totalAmount;
      }

      return res.status(200).json({
        status: 200,
        message: "Water progress fetched successfully.",
        data: {
          totalWaterDrunk,
        },
      });
    } catch (error) {
      console.error("Error fetching water progress:", error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong. Please try again.",
      });
    }
  }

  // sleep progress

  static async LastWeekSleepProgress(req, res) {
    const { userId } = req.query;

    try {
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

      const startDate = format(
        startOfDay(subDays(new Date(), 6)),
        "yyyy-MM-dd"
      );
      const endDate = format(endOfDay(new Date(), 1), "yyyy-MM-dd");

      const sleepLogs = await prisma.sleepLog.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      let totalSleepMinutes = 0;

      for (const sleepLog of sleepLogs) {
        totalSleepMinutes += sleepLog.totalSleep;
      }

      return res.status(200).json({
        status: 200,
        message: "Sleep progress fetched successfully.",
        data: {
          totalSleepMinutes,
        },
      });
    } catch (error) {
      console.error("Error fetching sleep progress:", error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong. Please try again.",
      });
    }
  }

  static async LastMonthSleepProgress(req, res) {
    const { userId } = req.query;

    try {
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

      // Calculate the start and end dates for the current month
      const currentDate = new Date();
      const startDate = format(startOfMonth(currentDate), "yyyy-MM-dd");
      const endDate = format(endOfMonth(currentDate), "yyyy-MM-dd");

      const sleepLogs = await prisma.sleepLog.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      let totalSleepMinutes = 0;

      for (const sleepLog of sleepLogs) {
        totalSleepMinutes += sleepLog.totalSleep;
      }

      return res.status(200).json({
        status: 200,
        message: "Sleep progress fetched successfully.",
        data: {
          totalSleepMinutes,
        },
      });
    } catch (error) {
      console.error("Error fetching sleep progress:", error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong. Please try again.",
      });
    }
  }

  // weight progress

  static async LastWeekWeightProgress(req, res) {
    const { userId } = req.query;

    try {
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

      const startDate = startOfDay(subDays(new Date(), 6));
      const endDate = endOfDay(new Date());

      const weightLogs = await prisma.weightLog.findMany({
        where: {
          userId,
          createdAt: {
            gte: startDate.toISOString(), // Ensure ISO-8601 format
            lte: endDate.toISOString(), // Ensure ISO-8601 format
          },
        },
      });

      return res.status(200).json({
        status: 200,
        message: "Weight progress fetched successfully.",
        data: {
          weightLogs,
        },
      });
    } catch (error) {
      console.error("Error fetching weight progress:", error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong. Please try again.",
      });
    }
  }

  // static async LastMonthWeightProgress(req, res) {
  //     const { userId } = req.query;

  //     try {
  //         const user = await prisma.user.findUnique({
  //             where: {
  //                 id: userId
  //             }
  //         })

  //         if (!user) {
  //             return res.status(400).json({
  //                 status: 400,
  //                 message: "User not found."
  //             })
  //         }

  //         // Calculate the start and end dates for the current month
  //         const currentDate = new Date();
  //         const startDate = format(startOfMonth(currentDate));
  //         const endDate = format(endOfMonth(currentDate));

  //         const weightLogs = await prisma.weightLog.findMany({
  //             where: {
  //                 userId,
  //                 createdAt: {
  //                     gte: startDate,
  //                     lte: endDate
  //                 }
  //             }
  //         });

  //         return res.status(200).json({
  //             status: 200,
  //             message: "Weight progress fetched successfully.",
  //             data: {
  //                 weightLogs
  //             }
  //         })

  //     } catch (error) {
  //         console.error("Error fetching weight progress:", error);
  //         return res.status(500).json({
  //             status: 500,
  //             message: "Something went wrong. Please try again.",
  //         })
  //     }
  // }
}

export default ProgressTracker;
