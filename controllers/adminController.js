const Admin = require("../models/adminModel");
// const  Category=require('../models/CategoryModel')
const user = require("../models/userModel");
const Product = require("../models/productsModel");
const Order = require("../models/orderModel");
const Coupon = require("../models/couponModel");
const couponHelper = require("../helpers/couponHelper");
const adminHelper = require("../helpers/adminHelper");
const banner = require("../models/bannerModel");
const newCoupons = require("../models/newCouponModel");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const session = require("express-session");

path = require("path");

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const adminData = await Admin.findOne({ email: email });

    if (adminData) {
      const passwordMatch = await bcrypt.compare(password, adminData.password);

      if (passwordMatch) {
        if (adminData.is_admin === 0) {
          res.render("/admin/login", {
            message: "Email or Password is incorrect",
          });
        } else {
          req.session.admin = adminData._id;

          res.redirect("/admin/home");
        }
      } else {
        res.render("login", { message: "Email and Password is incorrect" });
      }
    } else {
      res.render("login", { message: "Email and Password is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadDashboard = async (req, res) => {
  try {
    const dashBoardDetails = await adminHelper.loadingDashboard(req, res);

    const orderDetails = await adminHelper.OrdersList(req, res);

    const totalUser = dashBoardDetails.totaluser;
    const totalSales = dashBoardDetails.totalSales;
    const salesbymonth = dashBoardDetails.salesbymonth;
    const paymentMethod = dashBoardDetails.paymentMethod;
    const yearSales = dashBoardDetails.yearSales;
    const todaySales = dashBoardDetails.todaySales;
    let sales = encodeURIComponent(JSON.stringify(salesbymonth));

    res.render("home", {
      totalUser,
      todaySales: todaySales[0],
      totalSales: totalSales[0],
      salesbymonth: encodeURIComponent(JSON.stringify(salesbymonth)),
      paymentMethod: encodeURIComponent(JSON.stringify(paymentMethod)),
      yearSales: yearSales[0],
      orderDetails: orderDetails,
    });
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/admin-error");
  }
};

const usersListLoad = async (req, res) => {
  try {
    const userData = await user.find({ is_admin: 0 });
    res.render("Users", { users: userData });
  } catch {
    console.log(error.message);
  }
};

const deleteuser = async (req, res) => {
  try {
    const id = req.query.id;

    await user.deleteOne({ _id: id });

    res.redirect("/admin/Users");
  } catch (error) {
    console.log(error.message);
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy();

    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

const blockingUser = async (req, res) => {
  try {
    id = req.query.id;
    console.log(id);
    await user.findByIdAndUpdate({ _id: id }, { $set: { blocked: true } });

    res.redirect("/admin/Users");
  } catch (error) {
    console.log(error.message);
  }
};

const unblockuser = async (req, res) => {
  try {
    id = req.query.id;
    await user.findByIdAndUpdate({ _id: id }, { $set: { blocked: false } });
    res.redirect("/admin/Users");
  } catch (error) {
    console.log(error.message);
  }
};

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
    const couponCode = await couponHelper.generateCouponCode();
    res.send(couponCode);
  } catch (error) {
    console.log(error.message);
  }
};

//Add Coupn Data

const addCouponData = async (req, res) => {
  try {
    const data = {
      couponCode: req.body.coupon,
      validity: req.body.validity,
      minPurchase: req.body.minPurchase,
      minDiscountPercentage: req.body.minDiscountPercentage,
      maxDiscountValue: req.body.maxDiscount,
      description: req.body.description,
    };

    const response = await couponHelper.addCouponData(data);
    res.json(response);
  } catch (error) {
    console.log(error.message);
  }
};

//show coupon list

const couponList = async (req, res) => {
  try {
    const couponList = await Coupon.find();
    const newCouponList = await newCoupons.find();
    res.render("couponList", { newCouponList });
  } catch (error) {}
};

const loadAddBanner = async (req, res) => {
  try {
    const Banner = await banner.find();

    res.render("addBanner", { Banner: Banner });
  } catch (error) {
    console.log(error.messgae);
  }
};

const addNewBanner = async (req, res) => {
  try {
    const name = req.body.name;
    const discription = req.body.discription;
    const image = req.file.filename;

    const Banner = new banner({
      name: name,
      discription: discription,
      image: image,
    });

    const BannerData = await Banner.save();
    res.redirect("/admin/bannerList");
  } catch (error) {
    console.log(error.message);
  }
};

const showBanners = async (req, res) => {
  try {
    const Banners = await banner.find();

    res.render("bannersList", { Banners: Banners });
  } catch (error) {
    console.log(error.message);
  }
};

const unlistBanner = async (req, res) => {
  try {
    id = req.query.id;

    await banner.findByIdAndUpdate({ _id: id }, { $set: { unlist: true } });

    res.redirect("/admin/bannerList");
  } catch (error) {
    console.log(error.message);
  }
};

const listedBanner = async (req, res) => {
  try {
    id = req.query.id;

    await banner.findByIdAndUpdate({ _id: id }, { $set: { unlist: false } });

    res.redirect("/admin/bannerList");
  } catch (error) {
    console.log(error.message);
  }
};

const deleteBanner = async (req, res) => {
  try {
    const id = req.query.id;

    const product = await banner.findByIdAndDelete(id);

    res.redirect("/admin/bannerList");
  } catch (error) {
    console.log(error.messagae);
  }
};

const getSalesReport = async (req, res) => {
  try {
    const orderSuccessDetails = await adminHelper.orderSuccess();

    res.render("salesReport", {
      order: orderSuccessDetails.orderHistory,
      total: orderSuccessDetails.total,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const getSalesToday = async (req, res) => {
  try {
    const todaySales = await adminHelper.salesToday();

    res.render("salesReport", {
      order: todaySales.orderHistory,
      total: todaySales.total,
    });
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/admin-error");
  }
};

const getWeekSales = async (req, res) => {
  try {
    const weeklySales = await adminHelper.weeklySales();
    console.log("weeklySalesssssss", weeklySales);

    res.render("salesReport", {
      order: weeklySales.orderHistory,
      total: weeklySales.total,
    });
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/admin-error");
  }
};
const getMonthSales = async (req, res) => {
  try {
    const montlySales = await adminHelper.monthlySales();

    res.render("salesReport", {
      order: montlySales.orderHistory,
      total: montlySales.total,
    });
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/admin-error");
  }
};

const getYearlySales = async (req, res) => {
  try {
    const yearlySales = await adminHelper.yearlySales();

    res.render("salesReport", {
      order: yearlySales.orderHistory,
      total: yearlySales.total,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const salesWithDate = async (req, res) => {
  try {
    const salesWithDate = await adminHelper.salesWithDate(req, res);
    res.render("salesReport", {
      order: salesWithDate.orderHistory,
      total: salesWithDate.total,
    });
  } catch (error) {
    console.log(error.message, "salesWithDate controller error");
    res.redirect("/admin/admin-error");
  }
};

const downloadSalesReport = async (req, res) => {
  try {
    const salesPdf = await adminHelper.salesPdf(req, res);
  } catch (error) {
    console.log(error.message, "pdfSales controller error");
    res.redirect("/admin/admin-error");
  }
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

  console.log("llslslls", getDate);
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

module.exports = {
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
  postSalesReport,
  getSalesToday,
  getMonthSales,
  getYearlySales,
  getWeekSales,
  salesWithDate,
  downloadSalesReport,
};
