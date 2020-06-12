const express=require("express");
const router=new express.Router();
const subscribers=require("../models/subscribers");
const authentication=require("../middlewares/authentication");
const multer=require("multer");
const sharp=require("sharp");
const {welcomeMessage,deleteMessage}=require("../emails/emails");
router.get("/subscribers",authentication,async (req,res)=>{
    try {
        const Subscribers=await subscribers.find({});
        if(!Subscribers){
            return res.status(400).send("Invalid Id");
        }
        res.send(Subscribers);
    } catch (error) {
        res.status(500).send(error);
    }
})

router.post("/subscribers/logOut",authentication,async (req,res)=>{
   try {
    const token=req.token;
    const subscriber=req.subscriber;
    subscriber.tokens=await subscriber.tokens.filter((token)=>subscriber.tokens!=token);
    await subscriber.save();
    res.send();
   } catch (error) {
       res.status(500).send(error);
   }
})
router.post("/subscribers/logOutAll",authentication,async (req,res)=>{
    try {
     const subscriber=req.subscriber;
     subscriber.tokens=[];
     await subscriber.save();
     res.send();
    } catch (error) {
        res.status(500).send(error);
    }
 })
router.post("/subscribers",async (req,res)=>{
    try {
        const subscriber=new subscribers(req.body);
        const token=await subscriber.generateAuthToken();
        await subscriber.save();
        welcomeMessage(subscriber.email,subscriber.name);
        res.status(201).send({subscriber,token});
    } catch (error) {
        res.status(400).send(error); 
     }
})
router.post("/subscribers/login",async (req,res)=>{
    try {
        const subscriber=await subscribers.findByCredentials(req.body.email,req.body.password);
        const token=await  subscriber.generateAuthToken();
        res.send({subscriber,token});   
    } catch (error) {
        res.status(400).send(error);
    }
})
router.get("/subscriber/me",authentication,async (req,res)=>{
   try {
       const subscriber=req.subscriber;
       res.send(subscriber);
   } catch (error) {
       res.status(500).send(error);
   }
})
router.patch("/subscriber/me",authentication,async (req,res)=>{
    const updates=Object.keys(req.body);
    const allowedUpdates=["name","email","phoneNo","password"];
    const isValid=updates.every((update)=>allowedUpdates.includes(update));

    if(!isValid){
        return res.status(400).send("Invalid key to update");
    }
   try {
    const subscriber=req.subscriber;
    updates.forEach((update)=>subscriber[update]=req.body[update]);
    await subscriber.save();
    res.send(subscriber);
   } catch (error) {
    res.status(500).send(error);
   }
})
router.delete("/subscribers/me",authentication,async (req,res)=>{
    try {
        req.subscriber.remove();
        deleteMessage(req.subscriber.email,req.subscriber.name);
        res.send(req.subscriber);
    } catch (error) {
        res.status(500).send(error);
    }
})
const upload=multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,callback){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
           return callback(new Error("Please upload a image in the format jpg,jpeg,png"));
        }
        callback(undefined,true);
    }
})
router.post("/subscriber/me/upload",authentication,upload.single("avatar"),async (req,res)=>{
    const buffer=await sharp(req.file.buffer).resize({height:250,width:250}).png().toBuffer();
    req.subscriber.avatar=buffer;
    await req.subscriber.save();
    res.send();
},(error,req,res,next)=>{
    res.status(400).send({error:error.message});
})
router.delete("/subsciber/me/upload",authentication,upload.single("avatar",async (req,res)=>{
    req.subscriber.avatar=undefined;
    await req.subscriber.save();
    res.send();
}))
router.get("/subscriber/me/avatar",authentication,async(req,res)=>{
    try {
        const subscriber=req.subscriber;
        if(!subscriber||!subscriber.avatar){
          throw new Error();
        }
        res.set('Content-Type','image/png');
        res.send(subscriber.avatar);
    } catch (error) {
        res.status(404).send();
    }
})
module.exports=router;