
  const twilio= require('twilio')
  const config=require('../config/config')
  const User = require('../models/userModel');
  require('dotenv').config();

  const accountSid= process.env.ACCOUNT_SID;
  const verifyServiceSid=process.env.VERIFY_SID;
  const authToken=  process.env.AUTH_TOKEN;
  const client =twilio(accountSid,authToken)

  const sendOTP=async(phoneNumber)=>{
      try {

        await client.verify.v2.services(verifyServiceSid).verifications.create({

          to:phoneNumber,
          channel:'sms'
        })
         console.log("otp sended")
      } catch (error) {
        
        console.log(error.message)
        throw new Error('Failed to Send OTP')
        res.redirect('/user-error')
      }
  }





  const verifyOTP=async(req,res)=>{
    try {

      console.log('Verification start')
      const  userData= await User.findOne({_id:req.session.user_id})
      const userMobile=userData.mobile
      const otp=req.body.otp
      console.log("check ",userMobile,otp)

      client.verify.v2.services(verifyServiceSid).verificationChecks.create({to:userMobile,code:otp})
      .then(async(verification_check)=>{
       if(verification_check.status ==='approved'){
         console.log('you are verified',verification_check.status)
         await User.updateOne({ _id: req.session.user_id }, { otp: null,is_verified:1});
         res.redirect('/home')

       }
       else{

        res.render('otp', { message: 'Invalid OTP. Please try again.' });
       }
   
      });
      
    } catch (error) {
      
      console.log(error.message)
    
    }

  }


  module.exports={
      
      sendOTP,
      verifyOTP

  }

    