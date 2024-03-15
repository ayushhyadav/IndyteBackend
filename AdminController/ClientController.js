import prisma from "../db/db.config.js";

class ClientController {
  static async assignClients(req, res) {
    try {
      const { userId, dieticianId } = req.body;
      if (!userId || !dieticianId) {
        return res.status(400).json({
          status: 400,
          message: "Please provide client id and dietician id.",
        });
      }

      const dietitian = await prisma.dietician.findUnique({
        where: {
          id: dieticianId,
        },
      });

      if (!dietitian) {
        return res.status(400).json({
          status: 400,
          message: "Dietitian doesnt exist",
        });
      }

      const alreadyAssigned = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (alreadyAssigned.dieticianId) {
        return res.status(400).json({
          status: 400,
          message:
            "Dietician already assigned to this client, Please update the dietician.",
        });
      }

      const assignClient = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          dieticianId,
        },
      });
      return res.status(200).json({
        status: 200,
        message: "Client assigned successfully.",
        data: assignClient,
      });
    } catch (error) {
      console.log("The error is", error);
      if (error instanceof prisma.PrismaClientKnownRequestError) {
        return res.status(400).json({
          status: 400,
          message: "Client already assigned to this dietician.",
        });
      } else {
        return res.status(500).json({
          status: 500,
          message: "Something went wrong.Please try again.",
        });
      }
    }
  }
  static async assignManyClients(req, res) {
    try {
      const { userIds, dieticianId } = req.body;
      console.log({ userIds, dieticianId });
      console.log("STARTING ASSIGNING CLIENTS");
      if (!userIds || userIds?.length < 1 || !dieticianId) {
        return res.status(400).json({
          status: 400,
          message: "Please provide users ids and dietician id.",
        });
      }

      const dietitian = await prisma.dietician.findUnique({
        where: {
          id: dieticianId,
        },
      });

      if (!dietitian) {
        return res.status(400).json({
          status: 400,
          message: "Dietitian doesnt exist",
        });
      }
      let assignClient;
      for (const userId of userIds) {
        console.log("STARTING ASSIGNING CLIENTS", { userId });

        const alreadyAssigned = await prisma.user.findUnique({
          where: {
            id: userId,
          },
        });

        if (alreadyAssigned.dieticianId) {
          return res.status(400).json({
            status: 400,
            message:
              "Dietician already assigned to this client, Please update the dietician.",
          });
        }

        assignClient = await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            dieticianId,
          },
        });
      }
      return res.status(200).json({
        status: 200,
        message: "Client assigned successfully.",
        data: assignClient,
      });
    } catch (error) {
      console.log("The error is", error);
      if (error instanceof prisma.PrismaClientKnownRequestError) {
        return res.status(400).json({
          status: 400,
          message: "Client already assigned to this dietician.",
        });
      } else {
        return res.status(500).json({
          status: 500,
          message: "Something went wrong.Please try again.",
        });
      }
    }
  }

  static async updateClients(req, res) {
    try {
      const { userId, dieticianId } = req.body;
      if (!userId || !dieticianId) {
        return res.status(400).json({
          status: 400,
          message: "Please provide client id and dietician id.",
        });
      }

      const alreadyAssigned = await prisma.user.findUnique({
        where: {
          id: userId,
          dieticianId: dieticianId,
        },
      });

      if (alreadyAssigned) {
        return res.status(400).json({
          status: 400,
          message: "Client already assigned to same dietician.",
        });
      }

      const assignDietician = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          dieticianId,
        },
      });

      return res.status(200).json({
        data: assignDietician,
        staus: 200,
        message: "Dietician updated successfully.",
      });
    } catch (error) {
      console.log("The error is", error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong.Please try again.",
      });
    }
  }

  static async getClients(req, res) {
    try {
      const { dieticianId } = req.query;

      if (!dieticianId) {
        return res.status(400).json({
          status: 400,
          message: "Please provide dietician id.",
        });
      }

      const dietician = await prisma.dietician.findUnique({
        where: {
          id: dieticianId,
        },
      });

      if (!dietician) {
        return res.status(400).json({
          status: 400,
          message: "Dietician doesnt exist",
        });
      }

      const clients = await prisma.dietician.findUnique({
        where: {
          id: dieticianId,
        },
        include: {
          user: true,
        },
      });

      return res.status(200).json({
        clients: clients,
        status: 200,
        message: "Clients fetched successfully.",
      });
    } catch (error) {
      console.log("The error is", error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong.Please try again.",
      });
    }
  }
}

export default ClientController;
