const express= require("express");
const router = express.Router();
const userController = require("../controller/userController");
const middleWare = require("../middleware/middleware")
const postController = require("../controller/postController");
const commentController = require("../controller/commentController");
const followController = require("../controller/followController");
const replyController = require("../controller/replyController");
const profileController = require("../controller/profile")


///USER REGISTRATION
router.post("/singUp",userController.user);
router.post("/login",userController.login);
router.put("/updateUser",middleWare.autherization,userController.update)

/// POST APIS
router.post("/creatPost",middleWare.autherization,postController.creatPost);
router.post("/updatePost/:postId",middleWare.autherization,postController.updtepost);
router.delete("/deletePost/:postId",middleWare.autherization,postController.deletPost);
router.get("/getPosts",middleWare.autherization,postController.getAllpostsfollowing);

router.get("/getMyPosts",middleWare.autherization,postController.getAllMyposts)

///comment ======

router.post("/creatComment/:postId",middleWare.autherization,commentController.creatComment);
router.get("/getComment/:postId",middleWare.autherization,commentController.getAllComments);
router.delete("/deletComment/:commentId",middleWare.autherization,commentController.deletComment);

router.post("/like/:postId",middleWare.autherization,commentController.likePost);

///// reply

router.post("/reply/:commentId",middleWare.autherization,replyController.replyOncomment);
router.delete("/reply/:replyId",middleWare.autherization,replyController.deleteReply)

//follow
router.post("/follow/:profileId",middleWare.autherization,followController.follow);
router.get("/followers/:profileId",middleWare.autherization,followController.followers);

router.get("/following/:profileId",middleWare.autherization,followController.following)

/// profile;
router.get("/userProfile/:userName",middleWare.autherization,profileController.getProfile)
router.post("/updateProfile/:profileId",middleWare.autherization,profileController.updateProfile);

router.get("/findUserBypostId/:postId",middleWare.autherization,profileController.getUserById)

router.get("/myProfile",middleWare.autherization,profileController.getMyProfile);

router.get("/getUserByProfileId/:profileId",middleWare.autherization,profileController.getUserByProfileId)

router.all("/*",(req,res)=>{res.status(404).send({status:false,message:"url not found"})})

module.exports= router  