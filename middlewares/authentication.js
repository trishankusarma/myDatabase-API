const jwt=require("jsonwebtoken");
const subscribers=require("../models/subscribers");

const authentication=async (req,res,next)=>{
    try{
    const token=await req.header("Authorization").replace("Bearer ","");
    const decoded=jwt.verify(token,process.env.JWT_TOKEN);
    const subscriber=await subscribers.findOne({_id:decoded._id,'tokens.token':token});
    if(!subscriber){
        throw new Error("User Invalid");
    }
    req.token=token;
    req.subscriber=subscriber;
   next();
   }catch(e){
       res.status(403).send("Authenticate To proceed furthur");
   }
}
module.exports=authentication;