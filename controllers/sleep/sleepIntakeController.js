import prisma from "../../db/db.config.js";


class sleepIntakeController {

    static async createSleepIntake(req, res) {
        try {
            const { userId, bedtime, wakeUpTime } = req.body;

            // Convert bedtime and wake-up time to minutes
            const bedtime24h = convertTo24HourFormat(bedtime);
            // Convert wake-up time to 24-hour format
            const wakeUpTime24h = convertTo24HourFormat(wakeUpTime);
    
            // Calculate the time of sleep
            let timeOfSleep = wakeUpTime24h - bedtime24h;
            if (timeOfSleep < 0) {
                // Adjust for the wake-up time being on the next day
                timeOfSleep += 24 * 60; // Assuming a day has 24 hours
            }


            const date = new Date().toISOString().split('T')[0]; // Extract the current date


            const existingSleepLog = await prisma.sleepLog.findFirst({
                where: {
                    userId,
                    date
                }
            });

            if (existingSleepLog) {
                return res.status(400).json({ error: 'Sleep log already exists for the current date' });
            }
    
           
            let sleepLog;
    
     
                // If sleep log doesn't exist for the day, create a new one
                sleepLog = await prisma.sleepLog.create({
                    data: {
                        userId,
                        date,
                        totalSleep: timeOfSleep
                    }
                });
            
    
            
    
            // Create the sleep intake record
            const sleepIntake = await prisma.sleepIntake.create({
                data: {
                    user: { connect: { id: userId } },
                    bedtime,
                    wakeUpTime,
                    timeOfSleep:timeOfSleep, // Format time of sleep as HH:MM
                    sleepLog: {
                        connect: {
                            id: sleepLog.id
                        }
                    }
                }
            });
            res.status(201).json(sleepIntake);
        } catch (error) {
            console.error('Error creating sleep intake:', error);
            res.status(500).json({ error: 'Failed to create sleep intake record' });
        }
    }

    static async updateSleepIntake(req, res) {
        try {
            const { intakeId } = req.params;
            const { bedtime, wakeUpTime } = req.body;

            // Convert bedtime and wake-up time to minutes
            const bedtime24h = convertTo24HourFormat(bedtime);
            // Convert wake-up time to 24-hour format
            const wakeUpTime24h = convertTo24HourFormat(wakeUpTime);

            // Calculate the time of sleep
            let timeOfSleep = wakeUpTime24h - bedtime24h;
            if (timeOfSleep < 0) {
                // Adjust for the wake-up time being on the next day
                timeOfSleep += 24 * 60; // Assuming a day has 24 hours
            }

            // Find the sleep intake to be updated
            const existingSleepIntake = await prisma.sleepIntake.findUnique({
                where: {
                    id: intakeId
                },
                include: {
                    sleepLog: true
                }
            });

            if (!existingSleepIntake) {
                return res.status(404).json({ error: 'Sleep intake not found' });
            }

            // Update the sleep intake record
            const updatedSleepIntake = await prisma.sleepIntake.update({
                where: {
                    id: intakeId
                },
                data: {
                    bedtime,
                    wakeUpTime,
                    timeOfSleep // Format time of sleep as HH:MM
                }
            });

            // Update the associated sleep log record
            await prisma.sleepLog.update({
                where: {
                    id: existingSleepIntake.sleepLog.id
                },
                data: {
                    totalSleep: timeOfSleep
                }
            });

            res.status(200).json(updatedSleepIntake);
        } catch (error) {
            console.error('Error updating sleep intake:', error);
            res.status(500).json({ error: 'Failed to update sleep intake record' });
        }
    }
}

function convertTo24HourFormat(time12h) {
    const [time, period] = time12h.split(/(?=[AP]M)/i); // Split time and AM/PM
    let [hours, minutes] = time.split(':').map(Number); // Extract hours and minutes
    if (period.toUpperCase() === 'PM' && hours !== 12) {
        // Add 12 hours if period is PM and hours are not already 12
        hours += 12;
    } else if (period.toUpperCase() === 'AM' && hours === 12) {
        // Convert 12 AM to 0 hours
        hours = 0;
    }
    return hours * 60 + minutes; // Convert to minutes
}
export default sleepIntakeController;
