import prisma from "../../db/db.config.js";
import {
  stepSchema,
  validatorCompile,
} from "../../validations/authValidation.js";
import { formatDate } from "../../helpers/dateValidate.js";

class stepsIntakeController {
  static async createStepIntake(req, res) {
    try {
      const validator = await validatorCompile(stepSchema, req.body);
      if (validator.error)
        return res.status(400).json({ message: validator.error });
      const date = formatDate(validator.recordedAt);
      let stepLog;

      const existingStepLog = await prisma.stepLog.findFirst({
        where: {
          userId: validator.userId,
          date: date,
        },
      });

      if (existingStepLog) {
        await prisma.stepLog.update({
          where: { id: existingStepLog.id },
          data: {
            totalSteps: existingStepLog.totalSteps + validator.stepsTaken,
            totalCaloriesBurned:
              existingStepLog.totalCaloriesBurned + validator.caloriesBurned,
            totalDistance: existingStepLog.totalDistance + validator.distance,
            totalTimeWalkedMins:
              existingStepLog.totalTimeWalkedMins + validator.timeInMins,
          },
        });
        stepLog = existingStepLog;
      } else {
        stepLog = await prisma.stepLog.create({
          data: {
            userId: validator.userId,
            date: date,
            totalSteps: validator.stepsTaken,
            totalCaloriesBurned: validator.caloriesBurned,
            totalDistance: validator.distance,
            totalTimeWalkedMins: validator.timeInMins,
          },
        });
      }

      // Create the step intake record and associate it with the step log
      const stepIntake = await prisma.stepIntake.create({
        data: {
          user: { connect: { id: validator.userId } },
          stepsTaken: validator.stepsTaken,
          recordedAt: validator.recordedAt,
          timeInMins: validator.timeInMins,
          distance: validator.distance,
          caloriesBurned: validator.caloriesBurned,
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
      res.status(500).json({ error: error.message });
    }
  }
}

export default stepsIntakeController;
