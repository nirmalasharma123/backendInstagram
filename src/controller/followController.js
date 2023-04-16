const profileModel = require("../model/profile");
const userModel = require("../model/userModel");
const mongoose = require("mongoose");

let follow = async function (req, res) {
  try {
    if (!req.params.profileId)
      return res
        .status(400)
        .send({ status: false, message: "profile Id not fount" });

    let profileId = req.params.profileId;
    let profile = await profileModel.findOne({ _id: profileId });

    if (!profile) {
      return res.status(404).send({ status: false, message: "No user found" });
    }

    let userId = profile.profileOf;
    let followers = profile.followers;

    if (followers.includes(req.decode)) {
      await profileModel.findByIdAndUpdate(
        profileId,
        { $pull: { followers: req.decode }, $inc: { followersCount: -1 } },
        { new: true }
      );

      await profileModel.findOneAndUpdate(
        { profileOf: req.decode },
        { $pull: { following: userId }, $inc: { followingCount: -1 } },
        { new: true }
      );

      return res.status(200).send({ status: true, message: "User unFollowed" });
    }

    await profileModel.findByIdAndUpdate(
      profileId,
      { $push: { followers: req.decode }, $inc: { followersCount: 1 } },
      { new: true }
    );

    await profileModel.findOneAndUpdate(
      { profileOf: req.decode },
      { $push: { following: userId }, $inc: { followingCount: 1 } },
      { new: true }
    );

    return res.status(200).send({ status: true, message: "Followed" });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const followers = async function (req, res) {
  try {
    if (req.params.profileId && !mongoose.isValidObjectId(req.params.profileId))
      return res.status(400).send({ status: false, msg: "Invalid profileId" });

    let profileId = req.params.profileId;

    let findFollowers = await profileModel.findOne({ _id: profileId ,isDeleted}).populate('profileOf',{userName:1})
    if(!findFollowers) return res.status(400).send({status:false,message:"NO user found"})
    let followers = findFollowers.followers;

    let userDetails={};
    userDetails.profilePic=findFollowers.profilePic;
    userDetails.userNam = findFollowers.profileOf.userName;

    if(followers.length==0) return res.status(400).send({status:false,message:"NO followers"});

    let profile = await profileModel
      .find({ profileOf: { $in: followers } ,isDeleted:false})
      .populate("profileOf", { userName: 1 })
      .select({ profilePic: 1, userNam: 1, profileOf: 1 ,_id:1 });

    return res
      .status(200)
      .send({ status: true, message: "followers", data: {userDetails,followers:[...profile]}});
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const following = async function (req, res) {
  try {
    if (req.params.profileId && !mongoose.isValidObjectId(req.params.profileId))
    return res.status(400).send({ status: false, msg: "Invalid profileId" });

  let profileId = req.params.profileId;

  let findFollowers = await profileModel.findOne({ _id: profileId }).populate('profileOf',{userName:1})
  if(!findFollowers) return res.status(400).send({status:false,message:"NO user found"})
  let following = findFollowers.following;

  let userDetails={};
  userDetails.profilePic=findFollowers.profilePic;
  userDetails.userNam = findFollowers.profileOf.userName;

  if(followers.length==0) return res.status(400).send({status:false,message:"NO followers"});

  let profile = await profileModel
    .find({ profileOf: { $in: following } })
    .populate("profileOf", { userName: 1 })
    .select({ profilePic: 1, userNam: 1, profileOf: 1 ,_id:1});

  return res
    .status(200)
    .send({ status: true, message: "followers", data: {userDetails,following:[...profile]}});
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { follow, followers, following };
