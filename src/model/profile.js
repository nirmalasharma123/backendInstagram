const mongoose = require("mongoose");

const profileSchema= new mongoose .Schema({
 profileOf:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"userSingUP"
  },
 bio: {
    type:String,
    default:"your bio"
    
},
 profilePic:{
    type:String,
    default:"https://classroom-training-bucket.s3.ap-south-1.amazonaws.com/bookCover/no-profile-picture-6-1024x1024.jpg",
 },

  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "userSingUP" }],
  followersCount: {
    type: Number,
    default: 0,
  },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "userSingUP" }],
  followingCount: {
    type: Number,
    default: 0,
  },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "post" }],
  postCount: {
    type: Number,
    default: 0,
  },
},
  {timestamps:true}
);

module.exports= mongoose.model("profile",profileSchema)