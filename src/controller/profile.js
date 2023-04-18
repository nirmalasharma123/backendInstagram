const profile = require("../model/profile");
const profileModel = require("../model/profile");
const { uploadFile } = require("../controller/aws");
const mongoose = require("mongoose");
const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const postModel = require("../model/postModel");

/* get user profile   getting user profile through userName              */

const getProfile = async function (req, res) {
  try {
    let findUser = req.params.userName;

    if (!findUser) {
      return res
        .status(400)
        .send({ status: false, message: "no user name inputed" });
    }

    const searchRegex = new RegExp(findUser, "i");

    let findProfiles = await userModel.find({ userName: searchRegex });

    if (findProfiles.length === 0) {
      return res.status(404).send({ status: false, message: "no users found" });
    }

    let profiles = await profileModel
      .find({ profileOf: { $in: findProfiles } })
      .populate("profileOf", { userName: 1, _id: 0 })
      .populate("posts", {
        photo: 1,
        caption: 1,
        likesCount: 1,
        commentsCount: 1,
      })
      .select({
        followers: 0,
        following: 0,
        __v: 0,
        createdAt: 0,
        updatedAt: 0,
      });

    return res
      .status(200)
      .send({
        status: true,
        message: `users matching "${findUser}"`,
        data: profiles,
      });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

/////updatedprofile  updating users profile pic and bio



const updateProfile = async function (req, res) {
  try {
    if (req.params.profileId && !mongoose.isValidObjectId(req.params.profileId))
      return res.status(400).send({ status: false, msg: "Invalid profileId" });

    let profileId = req.params.profileId;
    let data = req.body;
    let files = req.files;

    if (files && files.length > 0) {
      let uploadUrl = await uploadFile(files[0]);
      data.profilePic = uploadUrl;
    }

    let findProfile = await profileModel.findOne({ _id: profileId });
    if (!findProfile)
      return res.status(400).send({ status: false, message: "No user found" });

    if (req.decode != findProfile.profileOf)
      return res
        .status(403)
        .send({ status: false, message: "You are not authorization for this" });

    let updateProfile = await profileModel
      .findOneAndUpdate({ _id: profileId }, { ...data }, { new: true })
      .populate("profileOf", { userName: 1, _id: 0 });

    return res.status(200).send({
      status: true,
      message: "profile updated successfully",
      data: updateProfile,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

/* get my profile 
{getting logged in users profile through jwt token}
*/

const getMyProfile = async function (req, res) {
  try {
    let userId = req.decode;

    let profile = await profileModel
      .findOne({ profileOf: userId })
      .populate("profileOf", { userName: 1, _id: 0 })
      .select({ followers: 0, following: 0, __v: 0 })
      .populate("posts", {
        photo: 1,
        caption: 1,
        commentsCount: 1,
        likesCount: 1,
      });

    if (!profile)
      return res
        .status(400)
        .send({ status: false, message: "NO profile found" });

    return res
      .status(200)
      .send({ status: true, message: "profile details", data: profile });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

/* get user profile by post Id

{ getting user by post ID taking post ID from params and fining profile in postModel}
{*/


const getUserById = async function (req, res) {
  try {
    if (req.params.postId && !mongoose.isValidObjectId(req.params.postId))
      return res.status(400).send({ status: false, msg: "Invalid profileId" });

    let postId = req.params.postId;

    
    let findPost = await postModel.findOne({ _id: postId, isDeleted: false });
    if (!findPost)
      return res.status(404).send({ status: false, message: "No user found" });

    let findProfile = await profileModel
      .findOne({ profileOf: findPost.postedBy })
      .populate("profileOf", { userName: 1 })
      .select({ followers: 0, following: 0, __v: 0 })
      .populate("posts", {
        photo: 1,
        caption: 1,
        commentsCount: 1,
        likesCount: 1,
      });

    return res
      .status(200)
      .send({ status: true, message: "user profile", data: findProfile });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

/* get user by profileId 
  
 getting post Id from param and finding user in profile model
*/

const getUserByProfileId = async function (req, res) {
  try {
    
    if (req.params.profileId && !mongoose.isValidObjectId(req.params.profileId))
      return res.status(400).send({ status: false, msg: "Invalid profileId" });

    let profileId = req.params.profileId;
    

    let findProfile = await profileModel
      .findOne({ _id: profileId })
      .populate("profileOf", { userName: 1 })
      .populate("posts", {
        photo: 1,
        caption: 1,
        commentsCount: 1,
        likesCount: 1,
        _id: 1,
      });
    

    if (!findProfile)
      return res.status(404).send({ status: false, message: "No user found" });

    return res
      .status(200)
      .send({ status: true, message: "user profile", data: findProfile });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getMyProfile,
  getUserById,
  getUserByProfileId,
};
