const mongoose=require('mongoose');
mongoose.connect("mongodb+srv://harivk1998:5h8Gsn1hzGPGWLKi@cluster0.d490y81.mongodb.net/");

 const express=require("express");
// const user_route = require('./routes/userRoute');
const app=express()

const path = require('path')
 const publicFolderPath = path.join(__dirname, './public');
app.use(express.static(publicFolderPath));


 //for user routes
const userRoute=require('./routes/userRoute')
app.use('/',userRoute)

//for Admin route
const adminRoute=require('./routes/adminRoute')
app.use('/admin',adminRoute)




 app.listen(3000,function(){

    console.log("Server is starting..  http://localhost:3000/")

 })