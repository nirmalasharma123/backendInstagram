const userModel = require("../model/userModel");
let jwt = require("jsonwebtoken");
let bcrypt = require("bcrypt");
let validator = require("../validation");
let profileModel = require("../model/profile");
const joi = require("joi")


const userSignUP = async function (req, res) {
  try {
    let data = req.body;
    let { error} = validator.userValidationSchema.validate(data);
    if (error) {
      return res.status(400).send(error.details[0].message + "joi");

    }
    let { name, email, password, phoneNo, userName } = data;

    let user = await userModel.findOne({
      $or: [{ email: email }],
    });
    if (user) {
      if (user.email === email)
        return res
          .status(409)
          .send({ status: false, message: `${email} is already in use` });
      if (user.phoneNo === phoneNo)
        return res
          .status(409)
          .send({ status: false, message: `${phoneNo} already in use` });
      if (user.userName === userName)
        return res
          .status(409)
          .send({ status: false, message: `${userName} already in use` });
    }

    const saltRounds = password.length;
    let hash = await bcrypt.hash(password, saltRounds);
    data.password = hash;
    const userCreated = await userModel.create(data);

    
    let obj = {};
    obj.profileOf = userCreated._id;
  

    await profileModel.create({...obj})
    res
      .status(201)
      .send({
        status: true,
        message: "User created successfully",
        data: userCreated,
      });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

let userLogin = async function (req, res) {
  try{

  let { error} = validator.logiValidation.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message + "joi");
    }
  let { email, password } = req.body;

  let findUser = await userModel.findOne({ email: email });

  if (!findUser)
    return res.status(404).send({ status: false, message: "user not found" });

  let checkPassword = await bcrypt.compare(password, findUser.password);
  if (!checkPassword)
    return res
      .status(400)
      .send({ status: false, message: "Incorrect credential" });

  let token = jwt.sign({ userId: findUser._id.toString() }, "hgsghsjsjjjjj");
  return res.status(200).send({ status: true, token: token })
  }catch(err){
    return res.status(500).send({status:false,message:err.message})
}}



///update user 
const updateUserName = async function (req, res) {
  try{

  let { error} = validator.userUpdate.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message + "joi");
  }

  let data = req.body;

  if (data.userName) {
    let findUser = await userModel.findOne({ userName: data.userName });
    if (findUser)
      return res
        .status(400)
        .send({ status: false, message: `${data.userName} already in use` });
  }
  if (data.email) {
    let email = await userModel.findOne({ email: data.email });
    if (email)
      return res
        .status(400)
        .send({ status: false, message: `${data.email} already in use` });
  }
  if (data.phoneNo) {
    let phone = await userModel.findOne({ phoneNo: data.phoneNo });
    if (phone)
      return res
        .status(400)
        .send({ status: false, message: `${data.phoneNo} already in use` });
  }

  let updateUser = await userModel
    .findOneAndUpdate({ _id: req.decode }, { ...data }, { new: true })
    .select({password:0});

  return res
    .status(200)
    .send({ status: true, message: "user updated", data: updateUser });
}catch(err){
  return res.status(500).send({status:false,message:err.message})
}
};

module.exports.user = userSignUP;
module.exports.login = userLogin;
module.exports.update = updateUserName;
