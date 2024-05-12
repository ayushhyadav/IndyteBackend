import { Router } from "express";
import fileupload from "express-fileupload";
import { onlyUser, onlyAdmin, allUser } from "../middleware/Authenticate.js";
import { Poll } from "../controllers/explore/ExploreController.js";
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

export default router;
