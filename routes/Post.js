const express = require("express")
const router = express.Router();

const postController = require("../controllers/Post");
const { isAuthenticated } = require("../middleware/Auth");

router.post("/create-post",isAuthenticated, postController.createNewPost);
router.get("/getPosts", postController.getAllPost)
router.put("/posts/:postId/update-post", isAuthenticated, postController.updatePost)
router.put("/posts/:postId/like", isAuthenticated, postController.likePost)
router.put("/posts/:postId/comment", isAuthenticated, postController.addComment)
router.put("/posts/:postId/delete", isAuthenticated, postController.deletePost)


module.exports = router;