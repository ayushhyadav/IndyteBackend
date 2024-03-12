import prisma from "../../db/db.config.js";


class StepsLogController {
    static async getStepsLog(req, res) {
        try {
            const { userId, date } = req.params;
            
            // Fetch the step log for the specified user and date
            const stepLog = await prisma.stepLog.findFirst({
                where: {
                    userId,
                    date
                },
                include: {
                    stepIntakes: true // Include associated step intakes
                }
            });
    
            if (!stepLog) {
                return res.status(404).json({ error: 'Step log not found for the specified user and date' });
            }
    
            res.json(stepLog);
        } catch (error) {
            console.error('Error retrieving step log:', error);
            res.status(500).json({ error: 'Failed to retrieve step log' });
        }
    }
    
    
}

export default StepsLogController; 