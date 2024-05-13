import { Router } from "express";
import fileupload from "express-fileupload";
import { onlyUser, onlyAdmin, allUser } from "../middleware/Authenticate.js";
import {
  Poll,
  Blogs,
  GetInspired,
  OurSuccess,
  ClientStories,
} from "../controllers/explore/ExploreController.js";
const router = Router();

router.post("/polls", fileupload(), onlyAdmin, Poll.createPoll);
router.get("/polls", allUser, Poll.getAllPolls);
router.get("/polls/:id", allUser, Poll.getPollDetails);
router.delete("/polls/:id", onlyAdmin, Poll.deletePoll);

router.post("/polls/comment", onlyUser, Poll.commentPoll);
router.delete("/polls/comment/:commentId", allUser, Poll.deleteCommentPoll);

router.post("/polls/like/:pollsId", onlyUser, Poll.likePoll);
router.post("/polls/unlike/:pollsId", onlyUser, Poll.unLikePoll);

router.post("/polls/:pollsId/vote/:voteOption", onlyUser, Poll.votePoll);
router.post("/polls/unvote/:pollsId", onlyUser, Poll.unVotePoll);

// Blogs
router.post("/blogs", fileupload(), onlyAdmin, Blogs.createBlog);
router.get("/blogs", allUser, Blogs.getAllBlog);
router.get("/blogs/:blogId", allUser, Blogs.getBlogDetails);
router.delete("/blogs/:blogId", onlyAdmin, Blogs.deleteBlog);

// Get Inspired
router.post(
  "/getInspired",
  fileupload(),
  onlyAdmin,
  GetInspired.createGetInspired
);
router.get("/getInspired", allUser, GetInspired.getGetInspired);
router.get(
  "/getInspired/:inspireId",
  allUser,
  GetInspired.getGetInspiredDetails
);
router.delete(
  "/getInspired/:inspireId",
  onlyAdmin,
  GetInspired.deleteGetInspired
);

// Our success
router.post(
  "/ourSuccess",
  fileupload(),
  onlyAdmin,
  OurSuccess.createOurSuccess
);
router.get("/ourSuccess", allUser, OurSuccess.getOurSuccess);
router.get("/ourSuccess/:successId", allUser, OurSuccess.getOurSuccessDetails);
router.delete("/ourSuccess/:successId", onlyAdmin, OurSuccess.deleteOurSuccess);

// Client stories
router.post(
  "/clientStories",
  fileupload(),
  onlyAdmin,
  ClientStories.createClientStories
);
router.get("/clientStories", allUser, ClientStories.getClientStories);
router.get(
  "/clientStories/:clientId",
  allUser,
  ClientStories.getClientStoriesDetails
);
router.delete("/clientStories/:clientId", onlyAdmin, ClientStories.deleteClientStories);

export default router;
