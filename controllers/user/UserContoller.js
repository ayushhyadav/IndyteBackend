import prisma from "../../db/db.config.js";

class UserController {
    static async getAllUsers(req, res) {
        try {
            const allUsers = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    email: true,
                    profile: true,
                    height: true,
                    height_unit: true,
                    weight: true,
                    weight_unit: true,
                    date_of_birth: true,
                    gender: true,
                    goal: true,
                    water_target: true,
                    sleep_target: true,
                    step_target: true,
                    calories_target: true,
                    dieticianId: true,
                }
            });
            res.status(200).json({ users: allUsers });
        } catch (error) {
            console.error("Error fetching all users:", error);
            res.status(500).json({ error: "Failed to fetch all users" });
        }
    }
    /**
     * returns all users who have not been assigned any clients yet
     */
    static async getNewUsers(_req, res) {
        try {
            const users = await prisma.user.findMany({ where: {dietician:null }})
            res.status(200).json({ users });


        } catch (error) {
            console.error("Error fetching all users:", {error});
            res.status(500).json({ error: "Failed to fetch all users" });
        }
    }
}

export default UserController;
