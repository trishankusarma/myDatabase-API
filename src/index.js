const express=require("express");
const app=express();
require("../mongoose/mongoose")
const subscriberRouter=require("../router/subscriberRouter");
const taskRouter=require("../router/taskRouter");
//creating middlewares
app.use(express.json());
app.use(subscriberRouter);
app.use(taskRouter);

const port=process.env.PORT;
app.listen(port,()=>{
    console.log("successfully running on port",port);
}) 