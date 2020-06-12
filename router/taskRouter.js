const express=require("express");
const tasks=require("../models/tasks");
const router=new express.Router();
const authentication=require("../middlewares/authentication")
router.get("/tasks",authentication,async (req,res)=>{
    try {
      const match={};
      const sort={};
      if(req.query.completed){
          match.completed=req.query.completed==='true';
      }
      if(req.query.sortBy){
          const parts=req.query.sortBy.split(':');
          sort[parts[0]]=parts[1]==="desc"?1:-1;
      }
    //const Tasks=await tasks.find({owner:req.subscriber._id});
     await req.subscriber.populate({
            path:"Tasks",
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.subscriber.Tasks);
    } catch (error) {
        res.status(500).send(error);
    }
})
router.post("/tasks",authentication,async (req,res)=>{
    try {
    const task=new tasks({
        ...req.body,
        owner:req.subscriber._id
    });
    await task.save();
    res.status(201).send(task);
    } catch (error) {
       res.status(400).send(error); 
    }
})
router.patch("/tasks/:id",authentication,async (req,res)=>{
    const updates=Object.keys(req.body);
    const allowedUpdates=["description","completed"];
    const  isValid=updates.every((update)=>allowedUpdates.includes(update));
    if(!isValid){
       return res.status(400).send("invalid Updates");
    }
    const _id=req.params.id;
    try {
        const task=await tasks.findOne({_id,owner:req.subscriber._id});
        if(!task){
            return res.status(404).send("Invalid input");
        }
        updates.forEach((update)=>task[update]=req.body[update]);
        await task.save();
        res.send(task);
    } catch (error) {
        res.status(400).send(error);
    }
})
router.delete("/tasks/:id",authentication,async (req,res)=>{
    const _id=req.params.id;
   try {
    const task=await tasks.findOneAndDelete({_id,owner:req.subscriber._id});
    if(!task){
        res.status(404).send("Invalid Id");
    }
    res.send(task);
   } catch (error) {
    res.status(500).send(error);
   }
})
router.get("/tasks/:id",authentication,async (req,res)=>{
    const _id=req.params.id;
   try {
    const task=await tasks.findById({_id,owner:req.subscriber._id});
    if(!task){
       return res.status(404).send("Invalid Id");
    }
    res.send(task);
   } catch (error) {
    res.status(500).send(error);
   }
})
module.exports=router;