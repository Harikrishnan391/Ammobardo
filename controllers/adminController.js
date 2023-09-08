const Admin=require("../models/adminModel")
// const  Category=require('../models/CategoryModel')
const user=require("../models/userModel")
const Product=require('../models/productsModel')
const Order= require('../models/orderModel')
const Coupon = require("../models/couponModel");
const couponHelper=require('../helpers/couponHelper')
const adminHelper=require('../helpers/adminHelper')
const banner=require('../models/bannerModel')
const newCoupons=require('../models/newCouponModel')
const bcrypt=require('bcryptjs')


path= require('path')


const securePassword=async(password)=>{

    try {
        
        const   passwordHash=await bcrypt.hash(password,10)
        return passwordHash

    } catch (error) {
        
        console.log(error.message)
    }
}

const loadLogin=async(req,res)=>{
    try {

        res.render('login')
        
    } catch (error) {
        
        console.log(error.message)
    }
}


const verifyLogin=async(req,res)=>{

    try {

        const email=req.body.email
        const password=req.body.password;

      const  adminData= await Admin.findOne({email:email})

      if(adminData){

       const passwordMatch=await bcrypt.compare(password,adminData.password)

        if(passwordMatch){

            if(adminData.is_admin===0){
                res.render('/admin/login',{message:"Email or Password is incorrect"})
            }
            else{

                req.session.user_id=adminData._id

                res.redirect('/admin/home')
            }

        }
        else{
            res.render('login',{message:"Email and Password is incorrect"})
        }
      }
      else{

        res.render('login',{message:"Email and Password is incorrect"})
      }
        
    } catch (error) {
        
        console.log(error.message)
        
    }
}

const loadDashboard = async (req, res) => {
    try {
     
      const orders = await Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: null,
            totalPriceSum: { $sum: "$items.price" },
            count: { $sum: 1 },
          },
        },
      ]);
  
      const salesData = await Order.aggregate([
        { $unwind: "$items" },
        {
          $match: {
            "status": "Delivered", // Consider only completed orders
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                // Group by the date part of createdAt field
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            dailySales: { $sum: "$items.price" }, // Calculate the daily sales
          },
        },
        {
          $sort: {
            _id: 1, // Sort the results by date in ascending order
          },
        },
      ]);
  
      const salesCount = await Order.aggregate([
        { $unwind: "$items" },
        {
          $match: {
            "status": "Delivered", // Consider only completed orders
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                // Group by the date part of createdAt field
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            orderCount: { $sum: 1 }, // Calculate the count of orders per date
          },
        },
        {
          $sort: {
            _id: 1, // Sort the results by date in ascending order
          },
        },
      ]);
  
      const Category = require('../models/CategoryModel'); // Import the Category model
      const categoryCount = await Category.countDocuments();
  
      const Product = require('../models/productsModel'); // Import the Product model
      const productsCount = await Product.countDocuments();
  
    //   const adminHelper = require('./adminHelper'); // Import adminHelper
    //   const onlinePay = await adminHelper.getOnlineCount();
  
      const latestorders = await Order.aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
      ]);
  
      res.render("home", {
        orders,
        productsCount,
        categoryCount,
        // onlinePay,
        salesData,
        order: latestorders,
        salesCount,
      });
    } catch (error) {
      console.log(error);
    }
  };



  


const usersListLoad=async(req,res)=>{

    try{

        const userData=await  user.find({is_admin:0})
        res.render('Users',{users:userData})
    }
    catch{

        console.log(error.message)
    }

}


const deleteuser=async(req,res)=>{

    try{

        const id=req.query.id

        await user.deleteOne({_id:id})

        res.redirect('/admin/Users')
    }
    catch(error){

        console.log(error.message)
    }
}

const logout=async(req,res)=>{
    
    try {

        req.session.destroy()

        res.redirect('/admin')
        
    } catch (error) {
        
        console.log(error.message)
    }
}

const blockingUser =async(req,res)=>{

    
    try {

         id=req.query.id
         console.log(id)
         await user.findByIdAndUpdate({_id:id},{$set:{blocked:true}})

         res.redirect('/admin/Users')
        
    } catch (error) {

       console.log(error.message) 
    }
}

const unblockuser= async(req,res)=>{

   try {
    id=req.query.id
    await  user.findByIdAndUpdate({_id:id},{$set:{blocked:false}})
    res.redirect('/admin/Users')
   } catch (error) {
    
    console.log(error.message)
   }
}

/**Load Coupon Load */


const loadCouponAdd = async (req, res) => {
    try {
      res.render("addCoupon");
    } catch (error) {
      console.log(error.message);
    }
  };


  ///generateCouponCode

const generateCouponCode = async (req, res) => {
    try {
     const couponCode=await couponHelper.generateCouponCode()
     res.send(couponCode)
   
    } catch (error) {
      console.log(error.message);
    }
  };


  //Add Coupn Data

  const addCouponData=async(req,res)=>{
    try {
  
      const data={
        couponCode: req.body.coupon,
        validity: req.body.validity,
        minPurchase: req.body.minPurchase,
        minDiscountPercentage: req.body.minDiscountPercentage,
        maxDiscountValue: req.body.maxDiscount,
        description: req.body.description,
      }
  
      const response= await couponHelper.addCouponData(data)
      res.json(response)
      
    } catch (error) {
  
      console.log(error.message);
      
    }
  }

  //show coupon list

const couponList= async(req,res)=>{
    try {
  
      const couponList = await Coupon.find()
      const newCouponList=await newCoupons.find()
      res.render('couponList',{ newCouponList})
  
      
    } catch (error) {
      
    }
  }


  const loadAddBanner=async(req,res)=>{

    try {

      const Banner=await banner.find()

      
      res.render('addBanner',{Banner:Banner})

    } catch (error) {
      
      console.log(error.messgae)
    }

  }


  const addNewBanner=async(req,res)=>{

    try {


      const name=req.body.name
      const discription=req.body.discription
      const image=req.file.filename

      const Banner= new banner({

        name:name,
        discription:discription,
        image:image

      })

     const BannerData= await Banner.save()
     res.redirect('/admin/bannerList')
     
      
    } catch (error) {

      console.log(error.message)
      
    }
  }


  const showBanners =async(req,res)=>{

    try {

       const Banners=await  banner.find()
  
      res.render('bannersList',{Banners:Banners})

      
    } catch (error) {

      console.log(error.message)
      
    }
  }

  const unlistBanner=async(req,res)=>{

    try {

      id=req.query.id

        await banner.findByIdAndUpdate({_id:id},{$set:{unlist:true}})

        res.redirect('/admin/bannerList')

      
    } catch (error) {

      console.log(error.message)
      
    }
    
  }


  const listedBanner=async(req,res)=>{

    try {

        id=req.query.id

        await banner.findByIdAndUpdate({_id:id},{$set:{unlist:false}})

        res.redirect('/admin/bannerList')
        
    } catch (error) {

       console.log(error.message) 
    }
 }


 const deleteBanner=async(req,res)=>{

  try {

      const id=req.query.id


      const product =await banner.findByIdAndDelete(id)

      res.redirect('/admin/bannerList')
      
  } catch (error) {
      console.log(error.messagae)   
  }
}     

////salesReport
const getSalesReport = async (req, res) => {
  const report = await adminHelper.getSalesReport();
  let details = [];
  const getDate = (date) => {
    const orderDate = new Date(date);
    const day = orderDate.getDate();
    const month = orderDate.getMonth() + 1;
    const year = orderDate.getFullYear();
    return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${
      isNaN(year) ? "0000" : year
    }`;
  };

  report.forEach((item) => {
    const order = item; // Each item now represents an individual item in a delivered order
    details.push(order);
  });

  res.render("salesReport", { details, getDate });
};



const postSalesReport = (req, res) => {
  const admin = req.session.admin;
  const details = [];
  const getDate = (date) => {
    const orderDate = new Date(date);
    const day = orderDate.getDate();
    const month = orderDate.getMonth() + 1;
    const year = orderDate.getFullYear();
    return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${
      isNaN(year) ? "0000" : year
    }`;
  };

  console.log('llslslls',getDate)
  adminHelper.postReport(req.body).then((orderData) => {
    console.log(orderData, "orderData");
    orderData.forEach((orders) => {
      details.push(orders.orders);
    });
    console.log(details, "details");
    res.render("salesReport", { details, getDate });
  });
};

/**============================================================================== */
/** new Coupon implementation */
/**=============================================================================== */






 
module.exports={
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    usersListLoad,
    deleteuser,
    securePassword,
    blockingUser,
    unblockuser,
    loadCouponAdd,
    generateCouponCode,
    addCouponData,
    couponList,
    loadAddBanner,
    addNewBanner,
    showBanners,
    unlistBanner,
    listedBanner,
    deleteBanner,
    getSalesReport,
    postSalesReport
}







