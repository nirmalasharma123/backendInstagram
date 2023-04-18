const postModel = require("../model/postModel");
const { uploadFile } = require("../controller/aws");
const userModel = require("../model/userModel");
const profileModel = require("../model/profile");
const { follow } = require("./followController");
const mongoose = require("mongoose");

///creating users post

const createPost = async function (req, res) {
  try {
    let files = req.files;
    let data = req.body;

    data.postedBy = req.decode;

    if (files && files.length > 0) {
      let uploadUrl = await uploadFile(files[0]);
      data.photo = uploadUrl;
    } else {
      return res
        .status(400)
        .send({ status: false, message: "Please Provide Image File" });
    }
         
     let profile = await profileModel.findOne({profileOf:req.decode});
     if(!profile) return res.status(404).send({status:false,message:"No user found"});
     data.profileId = profile._id;

    if (data.caption && data.caption.length > 500) {
      return res
        .status(400)
        .send({ status: false, message: "You have reached max cation length" });
    }
    let postCreate = await postModel.create(data);

    await profileModel.findOneAndUpdate(
      { profileOf: req.decode },
      { $push: { posts: postCreate._id }, $inc: { postCount: 1 } },
      { new: true }
    );

    return res.status(201).send({
      status: true,
      message: "post created successfully",
      data: postCreate,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

////////////////////updating the users post

let updatePost = async function (req, res) {
  try {
    if (req.params.postId && !mongoose.isValidObjectId(req.params.postId))
      return res.status(400).send({ status: false, msg: "Invalid postId" });

    let postId = req.params.postId;

    let findPost = await postModel.findOne({ _id: postId, isDeleted: false });
    if (!findPost)
      return res.status(400).send({ status: false, message: "NO post found" });

    if (findPost.postedBy != req.decode)
      return res
        .status(403)
        .send({ status: false, message: "excess denied !!!" });
    let files = req.files;

    let data = req.body;
    if (files && files.length > 0) {
      let uploadUrl = await uploadFile(files[0]);
      data.photo = uploadUrl;
    }

    if (data.caption && data.caption.length > 500) {
      return res
        .status(400)
        .send({ status: false, message: "You have reached max cation length" });
    }

    let updatePost = await postModel.findByIdAndUpdate(
      postId,
      { $set: { ...data } },
      { new: true }
    );
    return res
      .status(200)
      .send({
        status: true,
        message: "Updated successfully",
        data: updatePost,
      });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

/////deleting the posts
const deletePost = async function (req, res) {
  if (req.params.postId && !mongoose.isValidObjectId(req.params.postId))
    return res.status(400).send({ status: false, msg: "Invalid postId" });

  let postId = req.params.postId;

  let findPost = await postModel.findOne({ _id: postId, isDeleted: false });

  if (!findPost)
    return res.status(400).send({ status: false, message: "NO post found" });

  if (findPost.postedBy != req.decode)
    return res
      .status(403)
      .send({ status: false, message: "excess denied !!!" });

  await postModel.findByIdAndUpdate(postId, { isDeleted: true }, { new: true });

  await profileModel.findOneAndUpdate(
    { profileOf: findPost.postedBy },
    { $pull: { posts: postId }, $inc: { postCount: -1 } },
    { new: true }
  );

  return res
    .status(200)
    .send({ status: true, message: "Post deleted successfully" });
};

///get all the posts of following users posts

const getAllPostsFollowing = async function (req, res) {
  try {
    const loggedInUserId = req.decode;
    if (!loggedInUserId)
      return res.status(400).send({ status: false, message: "No user found" });

    const loggedInUserProfile = await profileModel.findOne({
      profileOf: loggedInUserId,
    });

    if (
      !loggedInUserProfile ||
      !loggedInUserProfile.following ||
      loggedInUserProfile.following.length === 0
    ) {
      let posts = await postModel
        .find({ isDeleted: false })
        .populate("postedBy",{userName:1,_id:1})
        .populate("profileId",{profilePic:1,_id:1})
        .select("-likes -comments  -createdAt -updatedAt -__v -isDeleted")
        .sort("-createdAt");

      return res
        .status(200)
        .send({ status: true, message: "All posts", data: posts });
    }

    const following = loggedInUserProfile.following;
    const posts = await postModel
      .find({ postedBy: { $in: following }, isDeleted: false })
      .populate("profileId",{profilePic:1,_id:1})
      .populate("postedBy",{userName:1,_id:1})
      .select("-likes -comments  -createdAt -updatedAt -__v -isDeleted")
      .sort("-createdAt");

    if (posts.length == 0)
      return res.status(400).send({ status: false, message: "No post yet !!" });

    return res.status(200).send({
      status: true,
      message: "Following posts fetched successfully",
      data: posts,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

///// getting all my posts

const getAllMyPosts = async function (req, res) {
  try {
    let userId = req.decode;

    let profileFind = await profileModel
      .findOne({ profileOf: userId })
      .populate({
        path: "posts",
        select: "likesCount  caption commentsCount photo  -_id , ",
        populate: {
          path: "postedBy",
          select: "userName -_id ",
        },
      })
      .select({ posts: 1, postCount: 1, _id: 0 });

    if (!profileFind)
      return res.status(400).send({ status: false, message: "No post" });

    if (profileFind.posts.length == 0)
      return res.status(400).send({ status: false, message: "No posts" });

    return res
      .status(200)
      .send({ status: true, message: "all posts", data: profileFind });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = {
  createPost,
  updatePost,
  deletePost,
  getAllPostsFollowing,
  getAllMyPosts,
};
