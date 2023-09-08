const User = require("../models/userModel");
const Category = require("../models/CategoryModel");
const Product = require("../models/productsModel");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const config = require("../config/config");
const otpController = require("../controllers/otpController");
const Admin = require("../models/adminModel");
const Address = require("../models/addressModel");
const Order = require("../models/orderModel");

const userHelper=require('../helpers/userHelper')

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const loadRegister = async (req, res) => {
  try {
    res.render("register");
  } catch (error) {
    console.log(error.message);
  }
};

const insertuser = async (req, res) => {
  try {
    const spassword = await securePassword(req.body.password);

    let userData;

    if (req.body.email === "admin@gmail.com") {
      // Admin registration
      const admin = new Admin({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mno,
        image: req.file.filename,
        password: spassword,
        is_admin: 1,
      });

      userData = await admin.save();
    } else {
      // User registration
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mno,
        image: req.file.filename,
        password: spassword,
        is_admin: 0,
      });

      userData = await user.save();
    }

    if (userData) {
      res.render("register", { message: "Registration successful" });
    } else {
      res.render("register", { message: "Registration failed" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//login  user method started

// const loginLoad = async (req, res) => {
//   try {
//     res.render("login");
//   } catch (error) {
//     console.log(error.message);
//   }
// };

const loginLoad = async (req, res) => {
  try {

     await userHelper.loginPageLoad(req,res)
     
      } catch (error) {
        console.log(error.message);
      }
};

//verifying User Login

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ email: email });

    if (user) {
      if (user.blocked) {
        res.render("login", {
          message:
            "User is blocked. Please contact the administrator for assistance.",
        });
      } else {
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
          if (user.is_verified === 0) {
            const otp = await otpController.sendOTP(user.mobile); // Send OTP to the user's mobile number
            await User.updateOne({ _id: user._id }, { otp: otp }); // Store the OTP in the user's record
            req.session.user_id = user._id;
            res.render("otp", {
              message: "Please enter the OTP sent to your mobile number",
            });
          } else {
            req.session.user_id = user._id;
            res.redirect("/home");
          }
        } else {
          res.render("login", { message: "Email and password are incorrect" });
        }
      }
    } else {
      res.render("login", { message: "Email and password are incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

/* ========================Index page Controller======================== */

const loadindex = async (req, res) => {
  try {
    const products = await Product.find();
    res.render("index", { products: products });
  } catch (error) {
    console.log(error.message);
  }
};

/* ========================HOME Page Controller======================== */

const loadHome = async (req, res) => {
  try {
    const products = await Product.find();
    const category = await Category.find({ unlist: false });
    const userData = await User.findById({ _id: req.session.user_id });
    res.render("home", {
      user: userData,
      products: products,
      category: category,
    });
  } catch (error) {
    res.redirect("/login");
    console.log(error.message);
  }
};

/* ========================Shop Controller======================== */

const viewShop = async (req, res) => {
  try {

      const  userData=  await User.findById({_id:req.session.user_id})
      
      res.render('shop')
  } catch (error) {
    console.log(error.message);
  }
};

const userLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

const loadProductDetails = async (req, res) => {
  try {
    let id = req.query.id;
    const productData = await Product.findById({ _id: id });

    if (req.session.user_id) {
      const userData = await User.findById({ _id: req.session.user_id });
      res.render("productDetails", { user: userData, product: productData });
    } else {
      res.render("productDetails", { product: productData, user: null });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadmyAccount = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findById({ _id: req.session.user_id });
    const userAddress = await Address.findOne({ user_id: userId });

    const userOrder = await Order.find({ user: userId })
      .populate("items.product")
      .exec();

    // console.log(userAddress)

    res.render("myAccount", {
      user: userData,
      userAddress: userAddress,
      myOders: userOrder,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const addAddress = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const { name, mobile, homeAddress, city, street, postalCode } = req.body;

    const newAddress = {
      name: name,
      mobile: mobile,
      homeAddress: homeAddress,
      city: city,
      street: street,
      postalCode: postalCode,
      isDefault: false,
    };

    let userAddress = await Address.findOne({ user_id: userId });

    if (!userAddress) {
      newAddress.isDefault = true;
      userAddress = new Address({ user_id: userId, address: [newAddress] });
    } else {
      userAddress.address.push(newAddress);
    }

    await userAddress.save();

    res.redirect("/myAccount");
  } catch (error) {
    console.log(error.message);
  }
};

const deleteAddress = async (req, res) => {
  try {
    id = req.query.id;
    const userId = req.session.user_id;
    console.log(id);

    await Address.updateOne(
      { user_id: userId },
      { $pull: { address: { _id: id } } }
    );
    res.redirect("/myAccount");
  } catch (error) {
    console.log(error.message);
  }
};

const orderSucess = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findById({ _id: req.session.user_id });

    res.render("Ordersucess", { user: userData });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadRegister,
  insertuser,
  loginLoad,
  verifyLogin,
  loadHome,
  userLogout,
  loadProductDetails,
  loadindex,
  loadmyAccount,
  addAddress,
  deleteAddress,
  orderSucess,
};
