const sendgrid=require("@sendgrid/mail");
sendgrid.setApiKey(process.env.SENDGRID_API_kEY);
const welcomeMessage=(email,name)=>{
    sendgrid.send({
        to:email,
        from:"trishankusarma165@gmail.com",
        subject:"Hey this is my email",
        text:'Good morning dude '+name
    })
}
const deleteMessage=(email,name)=>{
    sendgrid.send({
        to:email,
        from:"trishankusarma165@gmail.com",
        subject:"Hey this is my good bye message",
        text:"Good Bye Guys"+name
    })
}
module.exports={
    welcomeMessage,
    deleteMessage
}