const mongoose =require("mongoose");

const commentsSChema = new mongoose .Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userSingUP",
        required: true,
      },
      post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
        required: true,
      },
      text: {
        type: String,
        trim: true,   
      },
      replyCount: {
        type: Number,
        default: 0,
      },
      reply: [{ type: mongoose.Schema.Types.ObjectId, ref: "reply" }], 
      isDeletd:{
        type:Boolean,
        default:false
      }, 
    },
   
    {
        timeStamps:true}
    );

    module.exports= mongoose.model("commnet",commentsSChema)