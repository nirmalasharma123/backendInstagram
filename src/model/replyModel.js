const mongoose= require("mongoose");

const replySchema = new mongoose.Schema({

    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "userSingUP",
        required: true,

    },

    commentId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "commnet",
        required: true,
    },
    postId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
        required: true,
        
    },
    text:{
        type:String,
        max:500
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
},{ timestamps:true}
)

module.exports = mongoose.model("reply",replySchema)