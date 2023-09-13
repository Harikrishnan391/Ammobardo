
const User =require('../models/userModel')

const isLogin = async(req,res,next)=>{
    try {
        const user=await User.findOne({_id:req.session.user_id})

        if(req.session.user_id){
        
        }
        else{
           return res.redirect('/')
        }
        next()  
    } catch (error) {
       console.log(error.message); 
    }
}

const isLogout=async(req,res,next)=>{

    try {

        if(req.session.user_id){

            return res.redirect('/')
        }

        next();
    }
    catch(error){

        console.log(error.message)

    }
}


const isBlocked =async(req,res,next)=>{

    try {
        
        if(req.session.user_id){

            const user=await User.findOne({_id:req.session.user_id})
            if(user.blocked==true){

                req.session.destroy()
                res.redirect('/')

            }

        }
    } catch (error) {
       
        console.log(error.message)
    }
}

module.exports={

    isLogin,
    isLogout
   
}    