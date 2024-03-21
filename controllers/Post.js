const CatchAsyncError = require("../middleware/CatchAsyncError");
const Post = require("../model/PostModel");
const User = require("../model/UserModel");
const ErrorHandler = require("../utils/ErrorHandler");

exports.createNewPost = CatchAsyncError(async (req, res, next) => {
  const postUrl = req.body.postUrl;
  const userId = req.user.id;
  const post = await Post.create({ postUrl: postUrl, user: userId });
  await post.populate("user", "username email")
  return res.status(201).json({ success: true, newPost: post, message: "Post created successfully" });
});

exports.getAllPost = CatchAsyncError(async (req, res, next) =>{
    const posts = await Post.find().populate('user', "username email").populate('likes', 'username').populate('comments.user', "username");

    return res.status(200).json({success: true, allPosts: posts})
})

exports.updatePost = CatchAsyncError(async(req, res, next) =>{
    const extractPostId = req.params.postId;
    const extractPostUrl = req.body.postUrl;
    const userId = req.user.id;

    const getPost = await Post.findById(extractPostId);
    
    if(!getPost){
        return next(new ErrorHandler("Post not found or Invalid ID in post request", 404))
    }

    if(getPost.user.toString() !== userId.toString()){
        return next(new ErrorHandler("You cannot edit this post as it is not created by you.", 404))
    }

    getPost.postUrl = extractPostUrl;
    await getPost.save();
    return res.status(200).json({success: true, updatedPost: getPost, message: "Post is updated by the owner successfully."})

})

exports.deletePost = CatchAsyncError(async (req, res, next) =>{
    const extractPostId = req.params.postId;
    const userId = req.user.id;
    
    const getPost = await Post.findById(extractPostId);

    if(!getPost){
        return next(new ErrorHandler("Post not found or Invalid ID in post request", 404))
    }

    if(getPost.user.toString() !== userId.toString()){
        return next(new ErrorHandler("You cannot delete this post as it is not created by you.", 404))
    }
    await Post.findByIdAndDelete(extractPostId);
    return res.status(200).json({success: true, deletedPost: getPost, message: "Post deleted successfully"})

})


exports.likePost = CatchAsyncError(async (req, res, next) =>{
    const extractPostId = req.params.postId;
    const userId = req.user.id;
    const getPost = await Post.findById(extractPostId);
    if(!getPost){
        return next(new ErrorHandler("Post not found or Invalid ID in post request", 404))
    }


    if(getPost.likes.includes(userId)){
        return res.status(400).json({success: false, message: "User already liked this post", totalLikes: getPost.likes.length})
    }
    getPost.likes.push(userId);
    await getPost.save();

    return res.status(200).json({success: true, updatedPost: getPost, totalLikes: getPost.likes.length, message: "Like added successfully"})
})

exports.addComment = CatchAsyncError(async (req, res, next) =>{
    const extractComment = req.body.comment;
    const extractPostId = req.params.postId;
    const userId = req.user.id;

    const getPost = await Post.findById(extractPostId).populate('user', "username email").populate('likes', 'username').populate('comments.user', "username");
    if(!getPost){
        return next(new ErrorHandler("Post not found or Invalid ID in post request", 404))
    }
    getPost.comments.push({user: userId, commentText: extractComment});
    await getPost.save();
    // (await (await getPost.populate('user', "username email")).populate('likes', "username email")).populate("comments.user", "username email");
    return res.status(200).json({success: true, updatedPost: getPost, message: "Comment added successfully"})
})


