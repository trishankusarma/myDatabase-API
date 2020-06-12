require("../mongoose/mongoose");
const mongoose=require("mongoose");

const taskSchema=new mongoose.Schema({
    description:{
        type:String,
        required:true,
        trim:true
    },
    completed:{
        type:Boolean,
        default:false,
        trim:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'subscribers'
    }
},{
    timestamps:true
})
const tasks=mongoose.model("tasks",taskSchema);
module.exports=tasks;