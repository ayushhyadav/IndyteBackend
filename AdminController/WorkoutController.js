import prisma from "../db/db.config.js";

class WorkoutController {
  static async createWorkout(req, res) {
    const { name, exercises, description } = req.body;
    const totalExercises = req.body.exercises.length;
    let totalCaloriesBurnt = 0;

    try {
      const workoutExist = await prisma.workout.findUnique({
        where: {
          name,
        },
      });

      if (workoutExist) {
        return res.status(400).json({
          message: "Workout already exist",
        });
      }

      const workout = await prisma.workout.create({
        data: {
          name,
          description,
          totalCaloriesBurnt: 0,
        },
      });

      for (const exercise of exercises) {
        const exerciseExist = await prisma.exercise.findFirst({
          where: {
            id: exercise,
          },
        });

        if (!exerciseExist) {
          return res.status(400).json({
            message: "Exercise does not exist for id " + exercise.id,
          });
        }

        totalCaloriesBurnt += exerciseExist.caloriesBurn;

        const workoutExerciseExist = await prisma.workoutExercise.findFirst({
          where: {
            workoutId: workout.id,
            exerciseId: exerciseExist.id,
          },
        });

        if (workoutExerciseExist) {
          return res.status(400).json({
            message:
              exerciseExist.name +
              " Exercise already exists in workout " +
              workout.name,
          });
        }

        await prisma.workoutExercise.create({
          data: {
            workoutId: workout.id,
            exerciseId: exerciseExist.id,
          },
        });
      }

      const finalWorkout = await prisma.workout.update({
        where: {
          id: workout.id,
        },
        data: {
          totalCaloriesBurnt,
        },
      });

      return res.status(200).json({
        status: 200,
        message: "Workout Created Successfully",
        data: finalWorkout,
      });
    } catch (error) {
      console.log("the error is ", error);
      return res.status(500).json({
        message: "Something went wrong Please try again later",
      });
    }
  }

  static async getAllWorkouts(req, res) {
    try {
      const workouts = await prisma.workout.findMany({
        include: {
          excersises: {
            include: {
              exercise: true,
            },
          },
        },
      });

      return res.status(200).json({
        status: 200,
        message: "Workouts",
        data: workouts,
      });
    } catch (error) {
      console.log("the error is ", error);
      return res.status(500).json({
        message: "Something went wrong Please try again later",
      });
    }
  }

  static async unassignWorkout(req, res) {
    const { userId, workoutId, date } = req.body;

    try {
      const userExist = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!userExist) {
        return res.status(400).json({
          message: "User does not exist",
        });
      }

      const workoutAssigned = await prisma.userWithWorkout.findFirst({
        where: {
          userId,
          workoutId,
          date,
        },
      });

      if (!workoutAssigned) {
        return res.status(400).json({
          message: "Workout not assigned to this user",
        });
      }

      const deleteWorkout = await prisma.userWithWorkout.delete({
        where: {
          id: workoutAssigned.id,
        },
      });

      return res.status(200).json({
        message: "workout unassigned successfully",
        data: deleteWorkout,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Something went wrong",
      });
    }
  }

  static async assignWorkout(req, res) {
    const { userId, workoutId, date } = req.body;
    try {
      const userExist = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!userExist) {
        return res.status(400).json({
          message: "User does not exist",
        });
      }

      const workoutExist = await prisma.workout.findUnique({
        where: {
          id: workoutId,
        },
      });

      if (!workoutExist) {
        return res.status(400).json({
          message: "Workout does not exist",
        });
      }

      const workoutAssigned = await prisma.userWithWorkout.findFirst({
        where: {
          userId,
          workoutId,
          date,
        },
      });

      if (workoutAssigned) {
        return res.status(400).json({
          message: "Workout already assigned to this user",
        });
      }

      const assignWorkout = await prisma.userWithWorkout.create({
        data: {
          userId,
          workoutId,
          date,
        },
      });

      return res.status(200).json({
        status: 200,
        message: "Workout assigned successfully",
        data: assignWorkout,
      });
    } catch (error) {
      console.log("the error is ", error);
      return res.status(500).json({
        message: "Something went wrong Please try again later",
      });
    }
  }

  static async updateAssignedWorkout(req, res) {
    const { userId, workoutId, date } = req.body;
    try {
      const userExist = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!userExist) {
        return res.status(400).json({
          message: "User does not exist",
        });
      }

      const workoutExist = await prisma.workout.findUnique({
        where: {
          id: workoutId,
        },
      });

      if (!workoutExist) {
        return res.status(400).json({
          message: "Workout does not exist",
        });
      }

      const workoutAssigned = await prisma.userWithWorkout.findFirst({
        where: {
          userId,
          workoutId,
          date,
        },
      });

      if (!workoutAssigned) {
        return res.status(400).json({
          message: "Workout not assigned to this user",
        });
      }

      const assignWorkout = await prisma.userWithWorkout.update({
        where: {
          id: workoutAssigned.id,
        },
        data: {
          userId,
          workoutId,
          date,
        },
      });

      return res.status(200).json({
        status: 200,
        message: "Workout updated successfully",
        data: assignWorkout,
      });
    } catch (error) {
      console.log("the error is ", error);
      return res.status(500).json({
        message: "Something went wrong Please try again later",
      });
    }
  }

  static async MarkFinished(req, res) {
    const { userId, workoutId, date } = req.body;

    try {
      const userExist = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!userExist) {
        return res.status(400).json({
          message: "User does not exist",
        });
      }

      const workoutExist = await prisma.workout.findUnique({
        where: {
          id: workoutId,
        },
      });

      if (!workoutExist) {
        return res.status(400).json({
          message: "Workout does not exist",
        });
      }

      const workoutLogExist = await prisma.userWithWorkout.findFirst({
        where: {
          userId,
          workoutId,
          date,
        },
      });

      if (!workoutLogExist) {
        return res.status(400).json({
          message: "Workout not assigned to this user for this date",
        });
      }

      const workoutFinished = await prisma.userWithWorkout.findFirst({
        where: {
          userId,
          workoutId,
          date,
          finished: true,
        },
      });

      if (workoutFinished) {
        return res.status(400).json({
          message: "Workout already finished",
        });
      }

      const workoutLog = await prisma.userWithWorkout.update({
        where: {
          id: workoutLogExist.id,
        },
        data: {
          finished: true,
        },
      });

      return res.status(200).json({
        status: 200,
        message: "Workout log created successfully",
        data: workoutLog,
      });
    } catch (error) {
      console.log("the error is ", error);
      return res.status(500).json({
        message: "Something went wrong Please try again later",
      });
    }
  }

  static async getUserWorkouts(req, res) {
    const { userId } = req.query;
    try {
      const userExist = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!userExist) {
        return res.status(400).json({
          message: "User does not exist",
        });
      }

      const userWorkouts = await prisma.userWithWorkout.findMany({
        where: {
          userId,
        },
        include: {
          workout: {
            include: {
              excersises: true,
            },
          },
        },
      });

      return res.status(200).json({
        status: 200,
        message: "User workouts",
        data: userWorkouts,
      });
    } catch (error) {
      console.log("the error is ", error);
      return res.status(500).json({
        message: "Something went wrong Please try again later",
      });
    }
  }

  static async getUserWorkoutsForDate(req, res) {
    const { userId, date } = req.query;
    try {
      const userExist = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!userExist) {
        return res.status(400).json({
          message: "User does not exist",
        });
      }

      const userWorkouts = await prisma.userWithWorkout.findMany({
        where: {
          userId,
          date,
        },
        include: {
          workout: {
            include: {
              excersises: {
                include: {
                  exercise: true,
                },
              }, // Include exercises related to each workout
            },
          },
        },
      });

      return res.status(200).json({
        status: 200,
        message: "User workouts",
        data: userWorkouts,
      });
    } catch (error) {
      console.log("the error is ", error);
      return res.status(500).json({
        message: "Something went wrong Please try again later",
      });
    }
  }

  static async getUserWorkoutLogs(req, res) {
    const { userId, date } = req.query;
    try {
      const userExist = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!userExist) {
        return res.status(400).json({
          message: "User does not exist",
        });
      }

      const userWorkoutLogs = await prisma.userWithWorkout.findMany({
        where: {
          userId,
          date,
        },
        include: {
          workout: true,
        },
      });

      return res.status(200).json({
        status: 200,
        message: "User workout logs",
        data: userWorkoutLogs,
      });
    } catch (error) {
      console.log("the error is ", error);
      return res.status(500).json({
        message: "Something went wrong Please try again later",
      });
    }
  }
}

export default WorkoutController;
