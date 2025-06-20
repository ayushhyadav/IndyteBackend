import { Router } from "express";
import fileupload from "express-fileupload";
import { onlyUser, onlyAdmin, allUser } from "../middleware/Authenticate.js";
import {
  Poll,
  Blogs,
  GetInspired,
  OurSuccess,
  ClientStories,
  Collection,
  Article,
  PublicMeal,
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
router.delete(
  "/clientStories/:clientId",
  onlyAdmin,
  ClientStories.deleteClientStories
);

// Collection
router.post(
  "/collection",
  fileupload(),
  onlyAdmin,
  Collection.createCollection
);
router.get("/collection", allUser, Collection.getAllCollection);
router.get("/collection/:id", allUser, Collection.getCollectionDetails);
router.delete("/collection/:id", onlyAdmin, Collection.deleteCollection);

// article
router.post("/article", fileupload(), onlyAdmin, Article.createArticle);
router.get("/article", fileupload(), onlyAdmin, Article.getAllArticle);
router.get("/article/:id", allUser, Article.getArticleDetails);
router.delete("/article/:id", onlyAdmin, Article.deleteArticleDetails);

// public meals
router.post("/meals", fileupload(), onlyAdmin, PublicMeal.createPublicMeal);
router.get("/meals", fileupload(), onlyAdmin, PublicMeal.getPublicMeal);
router.get("/meals/:id", allUser, PublicMeal.getPublicMealDetails);
router.delete("/meals/:id", onlyAdmin, PublicMeal.deletePublicMeal);

export default router;
