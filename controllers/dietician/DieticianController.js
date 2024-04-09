import prisma from "../../db/db.config.js";
export default class DieticianController {
  static getClient = async (req, res) => {
    try {
      const dieticianId = req.user.id;
      const user = await prisma.dietician.findFirst({
        where: { id: dieticianId },
        select: {
          user: true,
        },
      });
      if (!user.user)
        return res.status(200).json({
          noOfClient: 0,
          clients: [],
        });
      return res.status(200).json({
        noOfClient: user.user.length,
        clients: user.user,
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  };
}
