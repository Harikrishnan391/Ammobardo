const express =require("express")
const multer = require("multer");
const admin_route=express()
const  config=require("../config/config")
const session =require ("express-session")
const nocache=require('nocache');
const multerConfig = require("../config/multerConfig");
const CategoryController=require('../controllers/categoryController')
const productController=require('../controllers/productController')
const cartController=require('../controllers/cartController')
const orderController=require('../controllers/orderController')
const profileController=require('../controllers/profileController')
const couponControllerN=require('../controllers/couponControllerN')


admin_route.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true
  }));

admin_route.use(nocache())

const bodyParser=require("body-parser")

admin_route.use(bodyParser.json())
admin_route.use(bodyParser.urlencoded({extended:true}))

admin_route.set('view engine','ejs')

admin_route.set('views','./views/admin')

const path=require("path")

const Adminauth=require('../middleware/adminAuth')

const adminController=require("../controllers/adminController")
// const CategoryController = require('../controllers/CategoryController');

admin_route.get('/', Adminauth.isLogout,adminController.loadLogin)

admin_route.post('/', adminController.verifyLogin)

admin_route.get('/home',Adminauth.isLogin,adminController.loadDashboard)

admin_route.get('/logout',Adminauth.isLogin,adminController.logout)

admin_route.get('/users',Adminauth.isLogin,adminController.usersListLoad)
admin_route.get('/delete-user',adminController.deleteuser)
admin_route.get('/blockingUser',adminController.blockingUser)
admin_route.get('/unblockuser',adminController.unblockuser)

admin_route.get('/addCategory',CategoryController.LoadCategory)
admin_route.post('/addCategory',CategoryController.addCategory)
admin_route.get('/unlistCategory',CategoryController.unlistCategory)
admin_route.get('/listCategory',CategoryController.listCategory)
admin_route.get('/deleteCategory',CategoryController.deleteCategory)


admin_route.get('/addProduct',productController.loadaddProduct)
admin_route.post('/addProduct',multerConfig.upload,productController.createProduct)

admin_route.get('/productsList',productController.loadProductList)
admin_route.get('/editProduct',productController.editproductLoad)
admin_route.post('/editProduct',multerConfig.upload,productController.updateProduct)
admin_route.get('/deleteProduct',productController.deleteProduct)
admin_route.get('/unlistProduct',productController.unlistProduct)
admin_route.get('/listedProduct',productController.listedProduct)

admin_route.get('/OrderList',orderController.OrderList)
admin_route.get('/orderDetails',orderController.orderDetails)
admin_route.get('/updateStatus',orderController. updateOrderStatus);
admin_route.get('/salesReport',adminController.getSalesReport )
admin_route.post('/salesReport',adminController.postSalesReport ) 

admin_route.get('/acceptReturn',profileController.acceptReturn)
admin_route.get('/DeclineReturn',orderController.declineReturn)

admin_route.get('/loadCouponAdd',adminController.loadCouponAdd )  
admin_route.get('/generate-coupon-code',adminController.generateCouponCode ) 

admin_route.post('/addCoupon',adminController.addCouponData ) 
admin_route.get('/couponList',adminController.couponList)

admin_route.get('/addBanner',adminController.loadAddBanner)
admin_route.post('/addBanner',multerConfig.uploadBnannerImage.single('image'),adminController.addNewBanner)
admin_route.get('/bannerList',adminController.showBanners)
admin_route.get('/unlistBanner',adminController.unlistBanner)
admin_route.get('/listBanner',adminController.listedBanner)
admin_route.get('/deleteBanner',adminController.deleteBanner)

//New coupon implementation
admin_route.get('/add-coupon', couponControllerN.addNewCouponGET);
admin_route.post('/add-coupon', couponControllerN.addNewCouponPOST);



admin_route.get('*',(req,res)=>{

  res.redirect('/home')
})


module.exports=admin_route