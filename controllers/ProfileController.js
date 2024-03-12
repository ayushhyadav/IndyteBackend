import prisma from "../db/db.config.js";
import { generateRandomNum, imageValidator } from "../utils/helper.js";

class ProfileController {
  
  static async index(req, res) {
    try {
      // Assuming you're using some sort of ORM like Mongoose
      const userId = req.user.id;
      const user = await prisma.user.findFirst({
        where: {
          id: userId
        },
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
      })

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.json({ status: 200, user });
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong!" });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const authUser = req.user;

      // Update user data
      await prisma.user.update({
        data: updateData,
        where: { id },
      });
      
      return res.json({
        status: 200,
        message: "User data updated successfully!",
      });
    } catch (error) {
      console.log("Error:", error);
      return res
        .status(500)
        .json({ message: "Something went wrong. Please try again!" });
    }
  }

  static async getSingleUseronId(req, res) {
    try {
        const { userId } = req.params;

        const user = await prisma.user.findFirst({
            where: {
                id: userId
            },
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

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found"
            });
        }

        return res.status(200).json({
            status: 200,
            user
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({
            status: 500,
            message: "Something went wrong. Please try again."
        });
    }
}



}

export default ProfileController;