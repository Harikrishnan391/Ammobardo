// const isLogin=async(req,res,next)=>{

//   try {
  
//   if(req.session.user_id)
//   {
//   const user =await User.findOne({_id:req.session.user_id})
//   if(user.is_verified==1){
//   next()
  
//   }else{
//   console.log('enter otp');

//   return res.redirect('/')
//   }
//   }
//   else{
  
//   return res.redirect('/')
//   }
//   }
//   catch(error){
  
//   console.log(error.message)

  
//   }
// }