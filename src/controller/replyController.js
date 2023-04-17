const replyModel = require("../model/replyModel");
let commentModel = require("../model/commentModel");
const postModel = require("../model/postModel");
const mongoose = require("mongoose");

const replyOnComment = async function (req, res) {
   
  try{
  if (req.params.commentId && !mongoose.isValidObjectId(req.params.commentId))
    return res.status(400).send({ status: false, msg: "Invalid commentId" });

  let commentId = req.params.commentId;
  let data = req.body;
  if(data.text.trim()=="") return res.status(400).send({status:false,message:" reply is empty"})

  
  let findComment = await commentModel.findOne({ _id: commentId ,isDeleted:false});

  if (!findComment) return res.status(404).send("no post found");
  if (data.text.length > 500)
    return res
      .status(400)
      .send({
        status: false,
        message: "you have reached your maximum reply count",
      });

  data.userId = req.decode;
  data.postId = findComment.post;
  data.commentId = commentId;

  let createReply = await replyModel.create(data);

  await commentModel.findByIdAndUpdate(
    commentId,
    { $push: { reply: createReply._id }, $inc: { replyCount: 1 } },
    { new: true }
  );

  return res.status(201).send({ data: createReply });
}
catch(err){
    return res.status(500).send({status:false,message:err.message})
}
};


//////Delete Reply

const deleteReply = async function (req, res) {

    try{
  if (req.params.replyId && !mongoose.isValidObjectId(req.params.replyId))
    return res.status(400).send({ status: false, msg: "Invalid replyId" });

  let replyId = req.params.replyId;

  let replyFind = await replyModel.findOne({ _id: replyId });

  if (!replyFind)
    return res.status(400).send({ status: false, message: "No comment found" });

  let findPostOwnern = await postModel.findOne({ _id: replyFind.postId });

  if (req.decode != replyFind.userId) {
    if (req.decode != findPostOwnern.postedBy)
      return res
        .status(403)
        .send({ status: false, msg: "You are not authorized" });
  }

  await replyModel.findByIdAndDelete(replyId);
  //update comment model

  await commentModel.findOneAndUpdate(
    { _id: replyFind.commentId },
    { $pull: { reply: replyId }, $inc: { replyCount: -1 } },
    { new: true }
  );

  return res
    .status(200)
    .send({ status: true, message: "Reply deleted successfully" });
}catch(err){
    return res.status(500).send({status:false,message:err.message})
  }};

module.exports = { replyOnComment, deleteReply };
