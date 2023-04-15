const mongoose = require("mongoose");

const userSchema= new mongoose.Schema({
    name :{
        type:String,
        required:true,
        minlength:3,
        maxlength:15
    },
    userName:{
        type:String,
        trim:true,
        required:true,
        unique:true

    },
    phoneNo:{
        type:String,
        required:true,
        unique:true
    },
    email :{
        type:String,
        required:true,
       unique:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        min:8,
        max:15,
       
    },
    isDeleted:{
        type:Boolean,
        default:false,
    },
   
},{timestamps:true

})
module.exports= mongoose.model("userSingUP",userSchema)

