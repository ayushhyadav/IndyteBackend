import prisma from "../db/db.config.js";
import { validDate, getDateRange, isValidObjectId } from "../helpers/dateValidate.js";

class MealController {
  static async register(req, res) {
    try {
      const { body, nutrition } = req.body;

      //   * Check if meal exist
      const findMeal = await prisma.meal.findUnique({
        where: {
          name: body.name,
        },
      });

      if (findMeal) {
        return res.status(400).json({
          errors: {
            meal: " meal already exist.please use another one.",
          },
        });
      }

      const meal = await prisma.meal.create({
        data: body,
      });

      const mealNutrition = await prisma.nutrition.create({
        data: {
          id: meal.id,
          cal: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fats: nutrition.fats,
        },
      });
      return res.json({
        status: 200,
        message: "meal created successfully",
        meal,
      });
    } catch (error) {
      console.log("The error is", error);
      res.status(500).json({
        status: 500,
        message: "Something went wrong.Please try again.",
      });
    }
  }

  static async index(req, res) {
    try {
      const mealsWithNutrition = await prisma.meal.findMany({
        include: {
          nutrition: true, // Include related nutrition data
        },
      });

      return res.json({ status: 200, meals: mealsWithNutrition });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Something went wrong! ${error}` });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.query;

      const meal = await prisma.meal.findFirst({
        where: {
          id: id,
        },
      });

      return res.json({
        status: 200,
        message: "got a meal!",
        meal,
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

      // Check if the meal exists
      const meal = await prisma.meal.findUnique({
        where: {
          id,
        },
      });

      if (!meal) {
        return res.status(404).json({ message: "meal not found" });
      }

      // Update the meal with the provided data
      const updatedmeal = await prisma.meal.update({
        where: {
          id,
        },
        data: updateData,
      });

      return res.json({
        status: 200,
        message: "meal updated successfully",
        meal: updatedmeal,
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

      // Check if the meal exists
      const meal = await prisma.meal.findUnique({
        where: {
          id: id,
        },
      });

      if (!meal) {
        return res.status(404).json({ message: "meal not found" });
      }

      // Delete the meal

      const deleteNutrition = await prisma.nutrition.delete({
        where: {
          id: id,
        },
      });

      const deleteMeal = await prisma.meal.delete({
        where: {
          id: id,
        },
      });

      return res.json({
        status: 200,
        message: "meal deleted successfully",
        meal: deleteMeal,
        deleteNutrition,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Something went wrong! ${error}` });
    }
  }
  static getUserMealsProgress = async (req, res) => {
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

      const parseData = (userMeals, time) => {
        let breakfast = 0;
        let lunch = 0;
        let dinner = 0;
        let other = 0;
        let total = 0;
        let completed = 0;
        let skipped = 0;
        let targetCalories = 0;
        let takenCalories = 0;
        let leftCalories = 0;

        if (!userMeals.length > 0) {
          return res.status(400).json({
            status: 404,
            message: "User meals not found for the current " + time,
            data: {
              total,
              completed,
              skipped: total - completed,
              targetCalories,
              takenCalories,
              leftCalories,
              caloriesCount: {
                breakfast,
                lunch,
                dinner,
                other,
              },
            },
          });
        }

        for (const meals of userMeals) {
          total++;
          if (meals.finished) {
            completed++;
            if (meals.meal?.nutrition) {
              takenCalories += meals.meal.nutrition[0]?.cal;
              switch (meals.mealTime) {
                case "BREAKFAST":
                  breakfast += meals.meal.nutrition[0]?.cal;
                  break;
                case "LUNCH":
                  lunch += meals.meal.nutrition[0]?.cal;
                  break;
                case "DINNER":
                  dinner += meals.meal.nutrition[0]?.cal;
                  break;
                default:
                  other += meals.meal.nutrition[0]?.cal;
                  break;
              }
            }
          } else {
            if (meals.meal?.nutrition)
              leftCalories += meals.meal.nutrition[0]?.cal;
          }
        }

        return res.status(200).json({
          status: 200,
          message: "User meals found for the current " + time,
          data: {
            total,
            completed,
            skipped: total - completed,
            targetCalories: takenCalories + leftCalories,
            takenCalories,
            leftCalories,
            caloriesCount: {
              breakfast,
              lunch,
              dinner,
              other,
            },
          },
        });
      };

      const yearlyData = async (year) => {
        const yearlyProgress = [];

        for (let month = 1; month < 13; month++) {
          const { startDate, endDate } = getDateRange(
            30,
            new Date(year, month)
          );

          // Retrieve user workouts within the current month
          const userMeals = await prisma.userWithMeals.findMany({
            where: {
              userId: user.id,
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

          let breakfast = 0;
          let lunch = 0;
          let dinner = 0;
          let other = 0;
          let total = 0;
          let completed = 0;
          let skipped = 0;
          let targetCalories = 0;
          let takenCalories = 0;
          let leftCalories = 0;

          if (!userMeals.length > 0) {
            yearlyProgress.push({
              month: month, // Month index starts from 0, so add 1 to make it human-readable
              year: parseInt(year),
              total,
              completed,
              skipped: total - completed,
              targetCalories,
              takenCalories,
              leftCalories,
              caloriesCount: {
                breakfast,
                lunch,
                dinner,
                other,
              },
            });
          } else {
            for (const meals of userMeals) {
              total++;
              if (meals.finished) {
                completed++;
                if (meals.meal?.nutrition) {
                  takenCalories += meals.meal.nutrition[0]?.cal;
                  switch (meals.mealTime) {
                    case "BREAKFAST":
                      breakfast += meals.meal.nutrition[0]?.cal;
                      break;
                    case "LUNCH":
                      lunch += meals.meal.nutrition[0]?.cal;
                      break;
                    case "DINNER":
                      dinner += meals.meal.nutrition[0]?.cal;
                      break;
                    default:
                      other += meals.meal.nutrition[0]?.cal;
                      break;
                  }
                }
              } else {
                if (meals.meal?.nutrition)
                  leftCalories += meals.meal.nutrition[0]?.cal;
              }
            }

            yearlyProgress.push({
              month: month, // Month index starts from 0, so add 1 to make it human-readable
              year: parseInt(year),
              total,
              completed,
              skipped: total - completed,
              targetCalories: takenCalories + leftCalories,
              takenCalories,
              leftCalories,
              caloriesCount: {
                breakfast,
                lunch,
                dinner,
                other,
              },
            });
          }
        }
        return res.status(200).json(yearlyProgress);
      };

      const queryData = async (days, currentDate) => {
        const { startDate, endDate } = getDateRange(days, currentDate);

        const userMeals = await prisma.userWithMeals.findMany({
          where: {
            userId: user.id,
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
        parseData(userMeals, date);
      };

      if (date > 1000 && date < 4000) {
        await yearlyData(date);
      } else if (validDate(date)) {
        console.log("he");
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
            await queryData(365, new Date());
            break;
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
}

export default MealController;
