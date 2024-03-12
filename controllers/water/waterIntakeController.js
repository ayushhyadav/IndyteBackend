import prisma from "../../db/db.config.js";


class waterIntakeController {

  static async createWaterIntake(req, res) {
    try {
        const { userId, amount, recordedAt } = req.body;

        // Create or update the corresponding water log
        const date = new Date(recordedAt).toISOString().split('T')[0]; // Extract the date "2023-12-24"
        let waterLog;

        const existingWaterLog = await prisma.waterLog.findFirst({
            where: {
                userId,
                date
            }
        });

        if (existingWaterLog) {
            // If water log exists for the day, update the total amount
            await prisma.waterLog.update({
                where: { id: existingWaterLog.id },
                data: {
                    totalAmount: existingWaterLog.totalAmount + amount
                }
            });
            waterLog = existingWaterLog;
        } else {
            // If water log doesn't exist for the day, create a new one
            waterLog = await prisma.waterLog.create({
                data: {
                    userId,
                    date,
                    totalAmount: amount
                }
            });
        }

        // Create the water intake record and associate it with the water log
        const waterIntake = await prisma.waterIntake.create({
            data: {
                user: { connect: { id: userId } },
                amount,
                recordedAt,
                waterLog: {
                    connect: {
                        id: waterLog.id
                    }
                }
            }
        });

        res.status(201).json(waterIntake);
    } catch (error) {
        console.error('Error creating water intake:', error);
        res.status(500).json({ error: 'Failed to create water intake record' });
    }
    }   

    static async deleteWaterIntake(req, res) {
        try {
          const { intakeId } = req.params;
    
          // Find the water intake record to be deleted
          const waterIntake = await prisma.waterIntake.findUnique({
            where: {
              id: intakeId,
            },
            include: {
              waterLog: true,
            },
          });
    
          if (!waterIntake) {
            return res
              .status(404)
              .json({ error: 'Water intake not found for the specified ID' });
          }
    
          // Decrement the total amount of the corresponding water log
          const waterLog = waterIntake.waterLog;
          await prisma.waterLog.update({
            where: { id: waterLog.id },
            data: {
              totalAmount: waterLog.totalAmount - waterIntake.amount,
            },
          });
    
          // Delete the water intake record
          await prisma.waterIntake.delete({
            where: {
              id: intakeId,
            },
          });
    
          return res.json({
            status: 200,
            message: 'Water intake deleted successfully!',
          });
        } catch (error) {
          console.error('Error deleting water intake:', error);
          return res
            .status(500)
            .json({ error: 'Failed to delete water intake record' });
        }
      }
    



}

export default waterIntakeController;
