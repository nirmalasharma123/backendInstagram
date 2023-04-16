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
router.put("/updateUser",middleWare.authorization,userController.update)

/// POST APIS
router.post("/creatPost",middleWare.authorization,postController.createPost);
router.post("/updatePost/:postId",middleWare.authorization,postController.updatePost);
router.delete("/deletePost/:postId",middleWare.authorization,postController.deletePost);
router.get("/getPosts",middleWare.authorization,postController.getAllPostsFollowing);

router.get("/getMyPosts",middleWare.authorization,postController.getAllMyPosts)

///comment ======

router.post("/creatComment/:postId",middleWare.authorization,commentController.createComment);
router.get("/getComment/:postId",middleWare.authorization,commentController.getAllComments);
router.delete("/deletComment/:commentId",middleWare.authorization,commentController.deleteComment);
///like posts
router.post("/like/:postId",middleWare.authorization,commentController.likePost);
router.get("/likedUsers/:postId",middleWare.authorization,commentController.getLikedUsers)

///// reply

router.post("/reply/:commentId",middleWare.authorization,replyController.replyOnComment);
router.delete("/reply/:replyId",middleWare.authorization,replyController.deleteReply)

//follow
router.post("/follow/:profileId",middleWare.authorization,followController.follow);
router.get("/followers/:profileId",middleWare.authorization,followController.followers);

router.get("/following/:profileId",middleWare.authorization,followController.following)

/// profile;
router.get("/userProfile/:userName",middleWare.authorization,profileController.getProfile)
router.post("/updateProfile/:profileId",middleWare.authorization,profileController.updateProfile);

router.get("/findUserBypostId/:postId",middleWare.authorization,profileController.getUserById)

router.get("/myProfile",middleWare.authorization,profileController.getMyProfile);

router.get("/getUserByProfileId/:profileId",middleWare.authorization,profileController.getUserByProfileId)

router.all("/*",(req,res)=>{res.status(404).send({status:false,message:"url not found"})})

module.exports= router  