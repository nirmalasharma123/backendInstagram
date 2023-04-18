const commentModel = require("../model/commentModel");
const postModel = require("../model/postModel");
const mongoose = require("mongoose");
const replyModel = require("../model/replyModel");
const profileModel = require("../model/profile");

////creating comments

const createComment = async function (req, res) {
  try {
    if (req.params.postId && !mongoose.isValidObjectId(req.params.postId))
      return res.status(400).send({ status: false, msg: "Invalid postId" });

    let data = req.body;
    let postId = req.params.postId;

    let findPost = await postModel.findOne({ _id: postId, isDeleted: false });

    data.post = postId;
    data.userId = req.decode;

    if (data.text.trim() == "")
      return res
        .status(400)
        .send({ status: false, message: "comment is empty" });

    if (!findPost)
      return res.status(404).send({ status: false, message: "Post not found" });

    let createComment = await commentModel.create(data);

    await postModel.findByIdAndUpdate(
      postId,
      { $push: { comments: createComment._id }, $inc: { commentsCount: 1 } },
      { new: true }
    );

    return res
      .status(201)
      .send({ status: true, message: "commented ", data: createComment });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

///getting all commments
const getAllComments = async function (req, res) {
  try {
    if (req.params.postId && !mongoose.isValidObjectId(req.params.postId))
      return res.status(400).send({ status: false, msg: "Invalid postId" });

    let postId = req.params.postId;

    let post = await postModel
      .findOne({ _id: postId, isDeleted: false })
      .populate("postedBy", { userName: 1 })
      .select({
        comments: 0,
        commentsCount: 0,
        likes: 0,
        likesCount: 0,
        photo: 0,
        isDeleted: 0,
      });

      if(!post) return res.status(400).send({status:false,message:"NO post found"})

    let findProfile = await profileModel.findOne({ profileOf: post.postedBy });
    if (!findProfile)
      return res.status(404).send({ status: false, message: "no user found" });
    let profilePic = findProfile.profilePic;

    let findComment = await commentModel
      .find({ post: postId, isDeleted: false })
      .populate({
        path: "userId",
        select: { userName: 1, _id: 0 },
      })
      .select({ text: 1, replyCount: 1 })
      .populate({
        path: "reply",
        select: { text: 1, _id: 0 },
        populate: {
          path: "userId",
          select: { userName: 1 },
        },
      });

    return res
      .status(200)
      .send({
        status: true,
        message: "All comments",
        data: [post, profilePic, ...findComment],
      });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

/////Deleting the user posts

const deleteComment = async function (req, res) {
  try {
    if (req.params.commentId && !mongoose.isValidObjectId(req.params.commentId))
      return res.status(400).send({ status: false, msg: "Invalid commentId" });

    let commentId = req.params.commentId;

    ////checking if the user is the same user who commented
    let findUser = await commentModel.findOne({
      _id: req.params.commentId,
      isDeleted: false,
    });

    if (!findUser)
      return res
        .status(404)
        .send({ status: false, message: "No comment found" });

    ////checking if the post if of the same user who wants to dealeted the comment
    let findPostOwnern = await postModel.findOne({
      _id: findUser.post,
      isDeleted: false,
    });

    if (req.decode != findUser.userId) {
      if (req.decode != findPostOwnern.postedBy)
        return res
          .status(403)
          .send({ status: false, msg: "You are not authorized" });
    }

    /// updating the comment db
    let findComment = await commentModel.findByIdAndUpdate(
      commentId,
      { isDeleted: true },
      { new: true }
    );
    if (!findComment)
      return res
        .status(404)
        .send({ status: false, message: "No comments found" });

    let postId = findComment.post;

    ///// reducing the total comment from the post and pulling out the deleted comment Id
    await postModel.findOneAndUpdate(
      { _id: postId, isDeleted: false },
      { $pull: { comments: commentId }, $inc: { commentsCount: -1 } },
      { new: true }
    );

    ///// deleting all the reply's related to the comment
    await replyModel.updateMany(
      { commentId: commentId, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    return res
      .status(200)
      .send({ status: true, message: "Comment deleted successfully" });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//liking on post

const likePost = async function (req, res) {
  try {
    if (req.params.postId && !mongoose.isValidObjectId(req.params.postId))
      return res.status(400).send({ status: false, msg: "Invalid postId" });

    let postId = req.params.postId;

    let findPost = await postModel.findOne({ _id: postId, isDeleted: false });
    if (!findPost)
      return res.status(404).send({ status: false, message: "No post found" });

    let likes = findPost.likes;

    if (likes.includes(req.decode)) {
      await postModel.findByIdAndUpdate(postId, {
        $pull: { likes: req.decode },
        $inc: { likesCount: -1 },
      });

      return res.status(200).send({ status: true, message: "Post disliked" });
    }

    let lik = await postModel.findByIdAndUpdate(postId, {
      $push: { likes: req.decode },
      $inc: { likesCount: 1 },
    });
    return res
      .status(200)
      .send({ status: true, message: `you liked on this post` });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
///getting the liked users

const getLikedUsers = async function (req, res) {
  try {
    if (req.params.profileId && !mongoose.isValidObjectId(req.params.profileId))
      return res.status(400).send({ status: false, msg: "Invalid profileId" });

    let postId = req.params.postId;

    let likes = await postModel.findOne({ _id: postId, isDeleted: false });
    if(!likes) return res.status(400).send({status:false,message:"No post found"})


    let findUserProfile = await profileModel
      .findOne({ profileOf: likes.postedBy })
      .populate("profileOf", { userName: 1 });

      
    let userDetails = {};
    userDetails.userName = findUserProfile.profileOf.userName;
    userDetails.profilePic = findUserProfile.profilePic;

    let findUsers = likes.likes;
    if (findUsers.length == 0)
      return res.status(400).send({ status: false, message: "NO likes yet " });

    let findProfile = await profileModel
      .find({ profileOf: { $in: findUsers } })
      .populate("profileOf", { userName: 1 })
      .select({ _id: 1, profilePic: 1 });

    return res
      .status(200)
      .send({
        status: true,
        message: "Liked users ",
        data: { userDetails, Likes: [...findProfile] },
      });
  } catch (err) {
    return res.status(500).send({ status: true, message: err.message });
  }
};

module.exports = {
  createComment,
  getAllComments,
  deleteComment,
  likePost,
  getLikedUsers,
};
