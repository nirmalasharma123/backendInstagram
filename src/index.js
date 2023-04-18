const express =  require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors")
const router = require("./router/router");
const app= express();
require('dotenv').config()

app.use(express.json());
app.use(multer().any());
app.use(cors())

mongoose.connect("mongodb+srv://jassu_172:jassusharma123@cluster0.fhbdfgf.mongodb.net/Instagram",{useNewUrlParser:true})
.then(()=>console.log("mongoDb is connect"))
.catch((err)=>console.log(err))

app.use("/",router);
app.listen(3001,function(){
    console.log("App is live on port 3001")
})
