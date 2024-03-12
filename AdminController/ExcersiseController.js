import prisma from "../db/db.config.js";

class ExcersiseController {
  static async createExcersise(req, res) {
    const payload = req.body;

    try {
      const excersiseExist = await prisma.exercise.findUnique({
        where: {
          name: payload.name,
        },
      });

      if (excersiseExist) {
        return res.status(400).json({
          message: "Excersise already exist",
        });
      }

      const exercise = await prisma.exercise.create({
        data: payload,
      });
      // api json body
      //             {
      //   "name": "Push-ups",
      //   "difficulty": "Intermediate",
      //   "caloriesBurn": 100,
      //   "description": "A classic bodyweight exercise targeting the upper body muscles.",
      //   "steps": ["Start in a plank position with your hands shoulder-width apart.", "Lower your body until your chest nearly touches the floor.", "Push yourself back up to the starting position.", "Repeat for the desired number of repetitions."],
      //   "equipments": ["None"],
      //   "reps": 15
      // }

      return res.status(200).json({
        status: 200,
        message: "Excersise Created Successfully",
        data: exercise,
      });
    } catch (error) {
      console.log("the error is ", error);
      return res.status(500).json({
        message: "Something went wrong Please try again later",
      });
    }
  }

  static async deleteExcersise(req, res) {
    const { id } = req.params;

    try {
      const excersise = await prisma.exercise.delete({
        where: {
          id,
        },
      });

      return res.status(200).json({
        message: "Excersise deleted successfully",
        data: excersise,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Something went wrong Please try again later",
      });
    }
  }

  static async getExcersise(req, res) {
    try {
      const exercise = await prisma.exercise.findMany();

      return res.status(200).json({
        message: "Excersise fetched successfully",
        data: exercise,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Something went wrong Please try again later",
      });
    }
  }
}

export default ExcersiseController;
