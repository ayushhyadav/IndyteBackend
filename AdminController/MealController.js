import prisma from "../db/db.config.js";

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
}

export default MealController;
