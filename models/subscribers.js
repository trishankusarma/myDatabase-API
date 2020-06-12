require("../mongoose/mongoose");
const validator=require("validator");
const bcrypt=require("bcryptjs");
const mongoose=require("mongoose");
const jwt=require("jsonwebtoken");
const tasks=require("../models/tasks")
const subscriberSchema=new mongoose.Schema({
    name:{
        type:String,
         required:true,
         trim:true
    },
    phoneNo:{
        type:Number,
        required:true,
        trim:true,
        minlength:10
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid email")
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:7,
        validate(value){
            if(value.toLowerCase().includes("password")){
                throw new Error("Password should not be password");
            }
        }
    },
   tokens:[
       {
         token:{
             type:String,
             required:true
         }
       }
   ],
   avatar:{
       type:Buffer
   }
},{
    timestamps:true
})
subscriberSchema.virtual("Tasks",{
    ref:'tasks',
    localField:'_id',
    foreignField:'owner'
})
subscriberSchema.methods.toJSON=function(){
    const subscriber=this;
    const subscriberObject=subscriber.toObject();
    delete subscriberObject.password;
    delete subscriberObject.tokens;
    delete subscriber.avatar;
    return subscriberObject;
}
subscriberSchema.methods.generateAuthToken=async function(){
    const subscriber=this;
    const token=jwt.sign({_id:subscriber._id.toString()},process.env.JWT_TOKEN);
    subscriber.tokens=subscriber.tokens.concat({token});
    await subscriber.save();
    return token;  
}
subscriberSchema.statics.findByCredentials=async function(email,password){
    const subscriber=await subscribers.findOne({email});
    if(!subscriber){
        throw new Error("Unable to logIn");
    }
    const isMatch=await bcrypt.compare(password,subscriber.password);
    if(!isMatch){
        throw new Error("Unable to logIn");
    }
    return subscriber;
}
subscriberSchema.pre("save", async function(next){
    const subscriber=this;
    if(subscriber.isModified("password")){
        subscriber.password=await bcrypt.hash(subscriber.password,8);
    }
    next();
})
subscriberSchema.pre("remove",async function(next){
    const  subscriber=this;
    await tasks.deleteMany({owner:subscriber._id});
    next();
})
const subscribers=mongoose.model("subscribers",subscriberSchema);
module.exports=subscribers;