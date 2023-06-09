const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    photo:{
        type:String,
        default:"no photo",
    },
    postedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"userSingUP",
        required:true
    },
    caption:{
        type:String,
        trim:true,
        max:500
        
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "userSingUP" }],
    likesCount: {
    type: Number,
    default: 0,   
  },
  profileId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"profile",
    required:true

  },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  commentsCount: {
    type: Number,
    default: 0,
  },

  isDeleted: {
    type: Boolean, 
    default: false 
   },
},{timestamps:true});

module.exports= mongoose.model("post",postSchema)