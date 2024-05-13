import Upload from "../upload/Upload.js";
import {
  isJSON,
  pollCommentValidate,
  getInspiredValidate,
} from "./ExploreValidator.js";
import prisma from "../../db/db.config.js";
import { isValidObjectId } from "../../helpers/dateValidate.js";
import {
  validatorCompile,
  pollValidate,
  ourSuccessValidate,
  clientStoriesValidate,
  blogValidate,
} from "./ExploreValidator.js";
export class Poll {
  static createPoll = async (req, res) => {
    try {
      if (!req.files)
        return res.status(400).json({ message: "No image found." });
      let poll = req.body.poll;

      if (isJSON(poll)) poll = JSON.parse(poll);
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
  static createBlog = async (req, res) => {
    try {
      if (!req.files)
        return res.status(400).json({ message: "No image found." });

      let blog = req.body.blog;
      if (isJSON(blog)) blog = JSON.parse(blog);

      let validBlog = await validatorCompile(blogValidate, blog);
      if (validBlog.error)
        return res.status(400).json({ message: validBlog.error });

      const blogExist = await prisma.blogs.findFirst({
        where: {
          title: blog.title,
        },
      });
      if (blogExist)
        return res.status(400).json({ message: "Blog already exists" });

      const banner = await Upload.uploadManyPhoto({
        image: req.files,
        path: "blogs",
      });
      if (banner.error)
        return res.status(400).json({ message: "Error uploading images." });

      const blogCreate = await prisma.blogs.create({
        data: {
          title: validBlog.title,
          content: validBlog.content,
          author: validBlog.author,
          banner: banner,
        },
      });
      if (blogCreate)
        return res.status(201).json({
          status: 201,
          message: "Blog created successfully.",
          blog: blogCreate,
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

  static getAllBlog = async (req, res) => {
    try {
      const blogs = await prisma.blogs.findMany({
        select: {
          id: true,
          title: true,
          banner: true,
        },
      });
      return res.status(200).json({
        status: 200,
        message: "Polls fetched successfully.",
        blogs,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal server error.",
      });
    }
  };

  static getBlogDetails = async (req, res) => {
    try {
      const { blogId } = req.params;
      if (!blogId || !isValidObjectId(blogId))
        return res.status(404).json({ error: "Invalid id or no id" });
      const blogExist = await prisma.blogs.findUnique({
        where: {
          id: blogId,
        },
      });
      if (!blogExist)
        return res.status(400).json({ message: "Blog does not exist." });
      return res.status(200).json({ blog: blogExist });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: " Internal server error" });
    }
  };

  static deleteBlog = async (req, res) => {
    try {
      const { blogId } = req.params;
      if (!blogId || !isValidObjectId(blogId))
        return res.status(404).json({ error: "Invalid id or no id" });
      const blogExist = await prisma.blogs.deleteMany({
        where: {
          id: blogId,
        },
      });
      if (blogExist.count > 0)
        return res.status(400).json({ message: "Blog deleted successfully." });
      return res.status(400).json({ message: "Blog does not exist." });
    } catch (error) {}
  };
}

export class GetInspired {
  static createGetInspired = async (req, res) => {
    try {
      if (!req.files)
        return res.status(400).json({ message: "No image found." });

      let getInspired = req.body.getInspired;
      if (isJSON(getInspired)) getInspired = await JSON.parse(getInspired);
      let validInspired = await validatorCompile(
        getInspiredValidate,
        getInspired
      );
      if (validInspired.error)
        return res.status(400).json({ message: validInspired.error });

      const inspiredExist = await prisma.getInspired.findFirst({
        where: {
          title: validInspired.title,
        },
      });
      if (inspiredExist)
        return res.status(400).json({ message: "Get inspired already exists" });

      const banner = await Upload.uploadManyPhoto({
        image: req.files,
        path: "inspired",
      });
      if (banner.error)
        return res.status(400).json({ message: "Error uploading images." });

      const inspiredCreate = await prisma.getInspired.create({
        data: {
          title: validInspired.title,
          content: validInspired.content,
          author: validInspired.author,
          category: validInspired.category,
          banner: banner,
        },
      });
      if (inspiredCreate)
        return res.status(201).json({
          status: 201,
          message: "Get inspired created successfully.",
          getInspired: inspiredCreate,
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

  static getGetInspired = async (req, res) => {
    try {
      const inspired = await prisma.getInspired.findMany({
        select: {
          id: true,
          category: true,
          title: true,
          banner: true,
        },
      });
      return res.status(200).json({
        status: 200,
        message: "Gets inspired fetched successfully.",
        getInspired: inspired,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal server error.",
      });
    }
  };

  static getGetInspiredDetails = async (req, res) => {
    try {
      const { inspireId } = req.params;
      if (!inspireId || !isValidObjectId(inspireId))
        return res.status(404).json({ error: "Invalid id or no id" });
      const blogExist = await prisma.getInspired.findUnique({
        where: {
          id: inspireId,
        },
      });
      if (!blogExist)
        return res
          .status(400)
          .json({ message: "Get inspired does not exist." });
      return res.status(200).json({ getInspired: blogExist });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: " Internal server error" });
    }
  };

  static deleteGetInspired = async (req, res) => {
    try {
      const { inspireId } = req.params;
      if (!inspireId || !isValidObjectId(inspireId))
        return res.status(404).json({ error: "Invalid id or no id" });
      const blogExist = await prisma.getInspired.deleteMany({
        where: {
          id: inspireId,
        },
      });
      if (blogExist.count > 0)
        return res
          .status(400)
          .json({ message: "Get Inspired deleted successfully." });
      return res.status(400).json({ message: "Get Inspired does not exist." });
    } catch (error) {}
  };
}

export class OurSuccess {
  static createOurSuccess = async (req, res) => {
    try {
      if (!req.files)
        return res.status(400).json({ message: "No image found." });

      let ourSuccess = req.body.ourSuccess;
      if (isJSON(ourSuccess)) ourSuccess = JSON.parse(ourSuccess);

      let validOurSuccess = await validatorCompile(
        ourSuccessValidate,
        ourSuccess
      );
      if (validOurSuccess.error)
        return res.status(400).json({ message: validOurSuccess.error });

      const validOurSuccessExist = await prisma.ourSuccess.findFirst({
        where: {
          title: validOurSuccess.title,
        },
      });
      if (validOurSuccessExist)
        return res.status(400).json({ message: "Our success already exists" });

      const banner = await Upload.uploadManyPhoto({
        image: req.files,
        path: "ourSuccess",
      });
      if (banner.error)
        return res.status(400).json({ message: "Error uploading images." });

      const validOurSuccessCreate = await prisma.ourSuccess.create({
        data: {
          title: validOurSuccess.title,
          content: validOurSuccess.content,
          author: validOurSuccess.author,
          category: validOurSuccess.category,
          tags: validOurSuccess.tags,
          clientName: validOurSuccess.clientName,
          clientDetails: validOurSuccess.clientDetails,
          banner: banner,
        },
      });
      if (validOurSuccessCreate)
        return res.status(201).json({
          status: 201,
          message: "Our success created successfully.",
          outSuccess: validOurSuccessCreate,
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

  static getOurSuccess = async (req, res) => {
    try {
      const inspired = await prisma.ourSuccess.findMany({
        select: {
          id: true,
          category: true,
          tags: true,
          title: true,
          banner: true,
        },
      });
      return res.status(200).json({
        status: 200,
        message: "Our success fetched successfully.",
        ourSuccess: inspired,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal server error.",
      });
    }
  };

  static getOurSuccessDetails = async (req, res) => {
    try {
      const { successId } = req.params;
      if (!successId || !isValidObjectId(successId))
        return res.status(404).json({ error: "Invalid id or no id" });
      const blogExist = await prisma.ourSuccess.findUnique({
        where: {
          id: successId,
        },
      });
      if (!blogExist)
        return res.status(400).json({ message: "Our success does not exist." });
      return res.status(200).json({ ourSuccess: blogExist });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: " Internal server error" });
    }
  };

  static deleteOurSuccess = async (req, res) => {
    try {
      const { successId } = req.params;
      if (!successId || !isValidObjectId(successId))
        return res.status(404).json({ error: "Invalid id or no id" });
      const blogExist = await prisma.ourSuccess.deleteMany({
        where: {
          id: successId,
        },
      });
      if (blogExist.count > 0)
        return res
          .status(400)
          .json({ message: "Our success deleted successfully." });
      return res.status(400).json({ message: "Our success does not exist." });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}

export class ClientStories {
  static createClientStories = async (req, res) => {
    try {
      if (!req.files)
        return res.status(400).json({ message: "No image found." });

      let clientStories = req.body.clientStories;
      if (isJSON(clientStories)) clientStories = JSON.parse(clientStories);

      let validClientStories = await validatorCompile(
        clientStoriesValidate,
        clientStories
      );
      if (validClientStories.error)
        return res.status(400).json({ message: validClientStories.error });

      const validOurSuccessExist = await prisma.clientStories.findFirst({
        where: {
          title: validClientStories.title,
        },
      });
      if (validOurSuccessExist)
        return res
          .status(400)
          .json({ message: "Client stories already exists" });

      const banner = await Upload.uploadManyPhoto({
        image: req.files,
        path: "clientStories",
      });
      if (banner.error)
        return res.status(400).json({ message: "Error uploading images." });

      const validOurSuccessCreate = await prisma.clientStories.create({
        data: {
          title: validClientStories.title,
          content: validClientStories.content,
          author: validClientStories.author,
          category: validClientStories.category,
          clientName: validClientStories.clientName,
          clientDetails: validClientStories.clientDetails,
          banner: banner,
        },
      });
      if (validOurSuccessCreate)
        return res.status(201).json({
          status: 201,
          message: "Client stories created successfully.",
          clientStories: validOurSuccessCreate,
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

  static getClientStories = async (req, res) => {
    try {
      const inspired = await prisma.clientStories.findMany({
        select: {
          id: true,
          category: true,
          title: true,
          banner: true,
        },
      });
      return res.status(200).json({
        status: 200,
        message: "Client stories fetched successfully.",
        clientStories: inspired,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal server error.",
      });
    }
  };

  static getClientStoriesDetails = async (req, res) => {
    try {
      const { clientId } = req.params;
      if (!clientId || !isValidObjectId(clientId))
        return res.status(404).json({ error: "Invalid id or no id" });
      const blogExist = await prisma.clientStories.findUnique({
        where: {
          id: clientId,
        },
      });
      if (!blogExist)
        return res
          .status(400)
          .json({ message: "Client stories does not exist." });
      return res.status(200).json({ clientStory: blogExist });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: " Internal server error" });
    }
  };

  static deleteClientStories = async (req, res) => {
    try {
      const { clientId } = req.params;
      if (!clientId || !isValidObjectId(clientId))
        return res.status(404).json({ error: "Invalid id or no id" });
      const blogExist = await prisma.clientStories.deleteMany({
        where: {
          id: clientId,
        },
      });
      if (blogExist.count > 0)
        return res
          .status(400)
          .json({ message: "Client stories deleted successfully." });
      return res
        .status(400)
        .json({ message: "Client stories does not exist." });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: " Internal server error" });
    }
  };
}

export class Collection {
  static createCollection = async (req, res) => {
    try {
      
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: " Internal Server error" });
    }
  };
}
