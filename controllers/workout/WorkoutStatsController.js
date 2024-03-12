import prisma from "../../db/db.config.js";

class WorkoutStatsController {
  // Controller to get the stats of finished and not finished meals of all times
  // Controller to get the stats of finished and not finished meals of all times
  static async getStats(req, res) {
    try {
      // Calculate the count of total workouts
      const totalWorkoutStats = await prisma.userWithWorkout.aggregate({
        _count: true,
      });

      // Calculate the count of finished workouts
      const finishedWorkoutStats = await prisma.userWithWorkout.aggregate({
        where: {
          finished: true,
        },
        _count: true,
      });

      // Calculate the count of not finished workouts
      const notFinishedWorkoutStats =
        totalWorkoutStats._count - finishedWorkoutStats._count;

      // Return the statistics as a response
      return res.status(200).json({
        status: 200,
        message: "Meal and Workout statistics",
        data: {
          workoutStats: {
            totalWorkouts: totalWorkoutStats._count,
            finishedWorkouts: finishedWorkoutStats._count,
            notFinishedWorkouts: notFinishedWorkoutStats,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      return res.status(500).json({
        message: "Something went wrong. Please try again later.",
      });
    }
  }

  static async getAllTimeWorkoutData(req, res) {
    try {
      const { page = 1, perPage = 10 } = req.query; // Default page is 1 and perPage is 10
      const offset = (page - 1) * perPage;

      const allTimeWorkoutData = await prisma.userWithWorkout.findMany({
        select: {
          userId: true,
          workoutId: true,
          date: true,
          finished: true,
          workout: {
            select: {
              name: true,
              excersises: {
                include: {
                  exercise: true,
                },
              },
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
        message: "All-time workout data",
        data: allTimeWorkoutData,
      });
    } catch (error) {
      console.error("Error fetching all-time workout data:", error);
      return res.status(500).json({
        message: "Something went wrong. Please try again later.",
      });
    }
  }
}

export default WorkoutStatsController;
