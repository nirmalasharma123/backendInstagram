let jwt = require("jsonwebtoken");

const authorization = async function(req,res,next){
    try{
        let token = req.headers["x-api-key"];
  
        if(!token) return res.status(400).send({status:false,message:"token must be present"});
        
       jwt.verify(token,"hgsghsjsjjjjj",function(error,decodedToken){
            if(error){
                if(error) return res.status(400).send({status:false,message:error.message})
            }

            req.decode=decodedToken.userId;           
    next();
    
   })
   }

   catch(error){
    return res.status(500).send({status:false,message:error.message})

   }
};

module.exports={authorization}