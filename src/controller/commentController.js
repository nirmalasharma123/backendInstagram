const commentModel = require("../model/commentModel");
const postModel = require("../model/postModel");
const mongoose = require("mongoose");
const replyModel = require("../model/replyModel");
const profileModel = require("../model/profile")

const creatComment = async function (req, res) {
  try {
    if (req.params.postId && !mongoose.isValidObjectId(req.params.postId))
      return res.status(400).send({ status: false, msg: "Invalid postId" });

    let data = req.body;
    let postId = req.params.postId;

    let findPost = await postModel.findOne({ _id: postId, isDeleted: false });

    data.post = postId;
    data.userId = req.decode;

    if(data.text.trim()=="") return res.status(400).send({status:false,message:"comment is empty"})

    if (!findPost)
      return res.status(404).send({ status: false, message: "Post not found" });

    let creatComment = await commentModel.create(data);

    await postModel.findByIdAndUpdate(
      postId,
      { $push: { comments: creatComment._id }, $inc: { commentsCount: 1 } },
      { new: true }
    );

    return res
      .status(201)
      .send({ status: true, message: "commented ", data: creatComment });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const getAllComments = async function (req, res) {
  try {
    if (req.params.postId && !mongoose.isValidObjectId(req.params.postId))
      return res.status(400).send({ status: false, msg: "Invalid postId" });

    let postId = req.params.postId;

    let post = await postModel
      .findOne({ _id: postId })
      .populate("postedBy", { userName: 1 })
      .select({
        comments: 0,
        commentsCount: 0,
        likes: 0,
        likesCount: 0,
        photo: 0,
        isDeleted: 0,
      });

      let findprofile= await profileModel.findOne({profileOf:post.postedBy});
      if(!findprofile) return res.status(400).send({status:false,messsage:"no user found"});
      let profilePic= findprofile.profilePic;

    let findC = await commentModel
      .find({ post: postId })
      .populate({
        path: "userId",
        select: { userName: 1, _id: 0 },
      })
      .select({ text: 1, replyCount: 1})
      .populate({
        path: "reply",
        select: { text: 1, _id: 0},
        populate: {
          path: "userId",
          select: { userName: 1 },
        },
      });

    return res
      .status(200)
      .send({ status: true, message: "All comments", data: [post,profilePic, ...findC] });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const deletComment = async function (req, res) {
  try {
    if (req.params.commentId && !mongoose.isValidObjectId(req.params.commentId))
      return res.status(400).send({ status: false, msg: "Invalid commentId" });

    let commentId = req.params.commentId;

    ////checking if the user is the same user who commented
    let findUser = await commentModel.findOne({ _id: req.params.commentId });

    if (!findUser)
      return res
        .status(404)
        .send({ status: false, message: "No comment found" });
  

    ////checking if the post if of the same user who wants to dealet  the comment
    let findPostOwnern = await postModel.findOne({ _id: findUser.post });

    if (req.decode != findUser.userId) {
      if (req.decode != findPostOwnern.postedBy)
        return res
          .status(404)
          .send({ status: false, msg: "You are not authorized" });
    }

    /// updating the comment db
    let findComment = await commentModel.findByIdAndDelete(
      commentId,
      { isDeleted: true },
      { new: true }
    );
    if (!findComment)
      return res
        .status(404)
        .send({ status: false, message: "No commnet found" });

    let postId = findComment.post;

    ///// reducing the total comment fromt the post and pulling out the deleted comment Id
    await postModel.findOneAndUpdate(
      { _id: postId },
      { $pull: { comments: commentId }, $inc: { commentsCount: -1 } },
      { new: true }
    );

    ///// deleting all the replyes related to the comment
    await replyModel.updateMany(
      { commentId: commentId },
      { isDeleted: true },
      { new: true }
    );

    return res
      .status(200)
      .send({ status: true, message: "Comment deletd sucessfylly" });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const likePost = async function (req, res) {
  try {
    if (req.params.postId && !mongoose.isValidObjectId(req.params.postId))
      return res.status(400).send({ status: false, msg: "Invalid postId" });

    let postId = req.params.postId;

    let findPost = await postModel.findOne({ _id: postId });
    if (!findPost)
      return res.status(404).send({ status: false, message: "No post found" });

    let likes = findPost.likes;

    if (likes.includes(req.decode)) {
      await postModel.findByIdAndUpdate(postId, {
        $pull: { likes: req.decode },
        $inc: { likesCount: -1 },
      });

      return res.status(200).send({ status: true, message: "Post desliked" });
    }

    let lik = await postModel.findByIdAndUpdate(postId, {
      $push: { likes: req.decode },
      $inc: { likesCount: 1 },
    });
    ;

    return res
      .status(200)
      .send({ status: true, message: `you liked on this post` });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { creatComment, getAllComments, deletComment, likePost };
