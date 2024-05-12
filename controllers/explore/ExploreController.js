import Upload from "../upload/Upload.js";
import { isJSON, pollCommentValidate } from "./ExploreValidator.js";
import prisma from "../../db/db.config.js";
import { isValidObjectId } from "../../helpers/dateValidate.js";
import { validatorCompile, pollValidate } from "./ExploreValidator.js";
export class Poll {
  static createPoll = async (req, res) => {
    try {
      if (!req.files)
        return res.status(400).json({ message: "No image found." });
      let poll = req.body.poll;

      if (isJSON(poll)) poll = JSON.parse(poll);
      console.log(poll);
      let validPoll = await validatorCompile(pollValidate, poll);
      if (validPoll.error)
        return res.status(400).json({ message: validPoll.error });

      const checkExisting = await prisma.polls.findFirst({
        where: {
          title: validPoll.title,
          topic: validPoll.topic,
        },
      });

      if (checkExisting)
        return res.status(400).json({ message: "Same poll already exists" });
      const banner = await Upload.uploadOnePhoto({
        image: req.files,
        path: "polls",
      });
      validPoll.banner = banner.url;
      const polls = await prisma.polls.create({
        data: validPoll,
      });
      if (polls)
        return res
          .status(201)
          .json({ message: "Poll created successfully", polls });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  };

  static getAllPolls = async (req, res) => {
    try {
      const polls = await prisma.polls.findMany({
        select: {
          id: true,
          topic: true,
          title: true,
          banner: true,
          _count: {
            select: { comment: true, likes: true, votes: true },
          },
        },
      });
      return res.status(200).json({
        status: 200,
        message: "Polls fetched successfully.",
        polls: polls,
      });
    } catch (error) {
      console.log("The error is", error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong.Please try again.",
      });
    }
  };

  static getPollDetails = async (req, res) => {
    try {
      const { id } = req.params;
      if (!id || !isValidObjectId(id)) {
        return res.status(404).json({ error: "Invalid id or no id" });
      }
      const poll = await prisma.polls.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          topic: true,
          title: true,
          banner: true,
          _count: {
            select: { comment: true, likes: true, votes: true },
          },
          comment: {
            select: {
              createdAt: true,
              comment: true,
              User: {
                select: {
                  name: true,
                  profile: true,
                },
              },
            },
          },
        },
      });

      const pollVotes = await prisma.pollVote.groupBy({
        by: ["option"],
        _count: true,
        where: {
          pollsId: id,
        },
      });

      if (poll)
        return res.status(200).json({
          status: 200,
          message: "Poll fetched successfully.",
          poll: poll,
          votes: pollVotes,
        });
      return res.status(404).json({
        status: 404,
        message: "Poll not found.",
      });
    } catch (error) {
      console.log("The error is", error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong. Please try again.",
      });
    }
  };

  static deletePoll = async (req, res) => {
    try {
      const { id } = req.params;
      if (!id || !isValidObjectId(id)) {
        return res.status(404).json({ error: "Invalid id or no id" });
      }
      const poll = await prisma.polls.delete({
        where: {
          id: id,
        },
      });
      if (poll)
        return res.status(200).json({
          status: 200,
          message: "Poll deleted successfully.",
        });
      return res.status(404).json({
        status: 404,
        message: "Poll not found.",
      });
    } catch (error) {
      console.log("The error is", error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong.Please try again.",
      });
    }
  };

  static commentPoll = async (req, res) => {
    try {
      const commentValidate = await validatorCompile(
        pollCommentValidate,
        req.body
      );
      if (commentValidate.error)
        return res.status(400).json({ message: commentValidate.error });
      const pollExist = await prisma.polls.findUnique({
        where: {
          id: commentValidate.pollsId,
        },
      });

      if (!pollExist)
        return res.status(400).json({ message: "Poll does not exist." });

      const commentPoll = await prisma.pollComment.create({
        data: {
          comment: commentValidate.comment,
          userId: req.user.id,
          pollsId: commentValidate.pollsId,
        },
      });
      if (commentPoll)
        return res.status(201).json({
          status: 201,
          message: "Comment created successfully.",
          commentPoll,
        });
      return res.status(400).json({
        status: 400,
        message: "Something went wrong. Please try again.",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal server error.",
      });
    }
  };

  static deleteCommentPoll = async (req, res) => {
    try {
      const user = req.user;

      const { commentId } = req.params;
      if (!commentId || !isValidObjectId(commentId)) {
        return res.status(404).json({ error: "Invalid id or no id" });
      }

      if (user.role !== "admin") {
        const userComment = await prisma.pollComment.findUnique({
          where: {
            id: commentId,
            userId: user.id,
          },
        });

        if (!userComment)
          return res
            .status(400)
            .json({ message: "Comment does not exist for the user." });
      }

      const commentPoll = await prisma.pollComment.deleteMany({
        where: {
          id: commentId,
        },
      });
      if (commentPoll.count > 0)
        return res.status(200).json({
          status: 200,
          message: "Comment deleted successfully.",
        });
      return res.status(404).json({
        status: 404,
        message: "Comment not found.",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal server error.",
      });
    }
  };
  static likePoll = async (req, res) => {
    try {
      const { pollsId } = req.params;
      if (!pollsId || !isValidObjectId(pollsId)) {
        return res.status(404).json({ error: "Invalid id or no id" });
      }
      const pollExist = await prisma.polls.findUnique({
        where: {
          id: pollsId,
        },
      });
      if (!pollExist)
        return res.status(400).json({ message: "Poll does not exist." });

      const likeExist = await prisma.pollLikes.findFirst({
        where: {
          userId: req.user.id,
          pollsId: pollsId,
        },
      });

      if (likeExist)
        return res.status(200).json({ message: "Poll already liked" });

      const likePoll = await prisma.pollLikes.create({
        data: {
          userId: req.user.id,
          pollsId: pollsId,
        },
      });
      if (likePoll)
        return res.status(201).json({
          status: 200,
          message: "Poll liked successfully.",
        });
      return res.status(400).json({
        status: 400,
        message: "Something went wrong. Please try again.",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal server error.",
      });
    }
  };

  static unLikePoll = async (req, res) => {
    try {
      const { pollsId } = req.params;
      if (!pollsId || !isValidObjectId(pollsId)) {
        return res.status(404).json({ error: "Invalid id or no id" });
      }
      const pollExist = await prisma.polls.findUnique({
        where: {
          id: pollsId,
        },
      });

      if (!pollExist)
        return res.status(400).json({ message: "Poll does not exist." });

      const likePoll = await prisma.pollLikes.deleteMany({
        where: {
          userId: req.user.id,
          pollsId: pollsId,
        },
      });
      if (likePoll.count > 0)
        return res.status(201).json({
          status: 200,
          message: "Poll disliked successfully.",
        });
      return res.status(200).json({
        status: 200,
        message: "Poll does not liked.",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal server error.",
      });
    }
  };

  static votePoll = async (req, res) => {
    try {
      const { pollsId, voteOption } = req.params;
      const intOption = Number(voteOption);

      console.log(intOption);
      if (
        !intOption ||
        !pollsId ||
        !isValidObjectId(pollsId) ||
        !typeof intOption === "number" ||
        voteOption < 1
      ) {
        return res.status(404).json({
          error: "Invalid id or voteOption, voteOption should be number from 1",
        });
      }
      const pollExist = await prisma.polls.findUnique({
        select: {
          choice: true,
        },
        where: {
          id: pollsId,
        },
      });
      if (!pollExist)
        return res.status(404).json({ message: "Pole does not exist." });

      const choice = pollExist.choice;
      if (choice.length < voteOption) {
        return res.status(400).json({
          message: `Vote option should be less than and equal to ${choice.length}`,
        });
      }

      const voteExist = await prisma.pollVote.findFirst({
        where: {
          userId: req.user.id,
          pollsId: pollsId,
        },
      });
      if (voteExist) {
        await prisma.pollVote.updateMany({
          data: {
            option: intOption,
          },
          where: {
            userId: req.user.id,
            pollsId: pollsId,
          },
        });
        return res.status(201).json({ message: "Vote updated successfully" });
      }

      await prisma.pollVote.create({
        data: {
          option: intOption,
          userId: req.user.id,
          pollsId: pollsId,
        },
      });

      return res.status(201).json({ message: "Vote created successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal server error.",
      });
    }
  };

  static unVotePoll = async (req, res) => {
    try {
      const { pollsId } = req.params;
      if (!pollsId || !isValidObjectId(pollsId)) {
        return res.status(404).json({ error: "Invalid id or no id" });
      }
      const deletedVote = await prisma.pollVote.deleteMany({
        where: {
          userId: req.user.id,
          pollsId: pollsId,
        },
      });
      if (deletedVote.count > 0)
        return res.status(200).json({ message: "Unvote successfully." });
      res.status(200).json({ message: "Not voted for poll." });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal server error.",
      });
    }
  };
}


export class Blogs {
  
}
