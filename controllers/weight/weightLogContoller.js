import prisma from "../../db/db.config.js";

class WeightLogController {
  static async createLog(req, res) {
    try {
      // Extract user ID from the request parameters
      const userId = req.params.userId;

      // Extract weight log data from the request body
      const {
        current_weight,
        goal_weight,
        weight_unit,
        bmi,
        imageUrl,
        rating,
        comment,
      } = req.body;

      // Create the weight log for the user
      const weightLog = await prisma.weightLog.create({
        data: {
          current_weight,
          goal_weight,
          weight_unit,
          bmi,
          imageUrl,
          rating,
          comment,
          // Associate the weight log with the user
          user: {
            connect: { id: userId },
          },
        },
      });

      // Send the created weight log as the API response
      res.json({ status: 201, data: weightLog });
    } catch (error) {
      console.error("Error creating weight log:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getLogs(req, res) {
    try {
      // Extract user ID from the request parameters
      const userId = req.params.userId;

      const userWithWeightLogs = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          weightLogs: {
            orderBy: { createdAt: "desc" }, // Sort weight logs by recordedAt in descending order
          },
        },
      });

      if (!userWithWeightLogs) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ status: 200, data: userWithWeightLogs.weightLogs });

      // Send the created weight log as the API response
    } catch (error) {
      console.error("Error gettign  weight logs:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default WeightLogController;
