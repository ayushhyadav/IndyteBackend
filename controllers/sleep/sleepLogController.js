import prisma from "../../db/db.config.js";


class SleepLogController {
    static async getsleepLog(req, res) {
        try {
            const { userId, date } = req.params;
            
            // Fetch the step log for the specified user and date
            const sleepLog = await prisma.sleepLog.findFirst({
                where: {
                    userId,
                    date
                },
                include: {
                    sleepIntakes: {
                        select: {
                            bedtime: true,
                            wakeUpTime: true, 
                        }
                    }
                }
            });
    
            if (!sleepLog) {
                return res.status(404).json({ error: 'Step log not found for the specified user and date' });
            }
    
            res.json(sleepLog);
        } catch (error) {
            console.error('Error retrieving step log:', error);
            res.status(500).json({ error: 'Failed to retrieve step log' });
        }
    }
    
    
}

export default SleepLogController; 