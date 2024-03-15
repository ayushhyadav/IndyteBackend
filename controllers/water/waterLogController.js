import prisma from "../../db/db.config.js";

class waterLogController {
  static async getWaterLog(req, res) {
    try {
      const { userId, date } = req.params;
      console.log(userId, date);

      // Fetch the water log for the specified user and date
      const waterLog = await prisma.WaterLog.findFirst({
        where: {
          userId,
          date,
        },
        include: {
          waterIntakes: true, // Include associated water intakes
        },
      });

      if (!waterLog) {
        return res.status(404).json({
          error: "Water log not found for the specified user and date",
        });
      }

      res.json(waterLog);
    } catch (error) {
      console.log("Error retrieving water log:", error);
      res.status(500).json({ error: "Failed to retrieve water log" });
    }
  }
}

export default waterLogController;
