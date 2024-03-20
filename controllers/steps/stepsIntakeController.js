import prisma from "../../db/db.config.js";

class stepsIntakeController {
  static async createStepIntake(req, res) {
    try {
      const {
        userId,
        stepsTaken,
        recordedAt,
        timeInMins,
        distance,
        caloriesBurned,
      } = req.body;

      // Create or update the corresponding step log
      const date = new Date(recordedAt).toISOString().split("T")[0]; // Extract the date "2023-12-24"
      let stepLog;

      const existingStepLog = await prisma.stepLog.findFirst({
        where: {
          userId,
          date,
        },
      });

      if (existingStepLog) {
        // If step log exists for the day, update the totals
        await prisma.stepLog.update({
          where: { id: existingStepLog.id },
          data: {
            totalSteps: existingStepLog.totalSteps + stepsTaken,
            totalCaloriesBurned:
              existingStepLog.totalCaloriesBurned + caloriesBurned,
            totalDistance: existingStepLog.totalDistance + distance,
            totalTimeWalkedMins:
              existingStepLog.totalTimeWalkedMins + timeInMins,
          },
        });
        stepLog = existingStepLog;
      } else {
        // If step log doesn't exist for the day, create a new one
        stepLog = await prisma.stepLog.create({
          data: {
            userId,
            date,
            totalSteps: stepsTaken,
            totalCaloriesBurned: caloriesBurned,
            totalDistance: distance,
            totalTimeWalkedMins: timeInMins,
          },
        });
      }

      // Create the step intake record and associate it with the step log
      const stepIntake = await prisma.stepIntake.create({
        data: {
          user: { connect: { id: userId } },
          stepsTaken,
          recordedAt,
          timeInMins,
          distance,
          caloriesBurned,
          stepLog: {
            connect: {
              id: stepLog.id,
            },
          },
        },
      });

      res.status(201).json(stepIntake);
    } catch (error) {
      console.error("Error creating step intake:", error);
      res.status(500).json({ error: "Failed to create step intake record" });
    }
  }
}

export default stepsIntakeController;
