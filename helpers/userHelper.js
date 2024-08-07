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
const Wallet = require("../models/walletModel");
const banner = require("../models/bannerModel");
const coupons = require("../models/couponModel");
const newCoupons = require("../models/newCouponModel");
const wishListHelper = require("../helpers/wishListHelper");
const generateOtp = require("../util/generateOtp");
const generateMail = require("../util/generateMail");
const randomstring = require("randomstring");
const Cart = require("../models/cartModel");
const e = require("express");
require("dotenv").config();

module.exports = {
  // Hashes the given password using bcrypt.
  securePassword: async (password) => {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      return passwordHash;
    } catch (error) {
      console.log(error.message);
    }
  },

  // Loads the registration page.
  loadingRegister: async (req, res) => {
    try {
      res.render("register");
    } catch (error) {
      console.log(error.message);
    }
  },
  // send  email to verify

  sendResetPasswordMail: async (name, email, token) => {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        requireTls: true,
        auth: {
          user: process.env.FROM_EMAIL,
          pass: process.env.MAIL_PASS,
        },
      });
      const mailOptions = {
        from: config.emailUser,
        to: email,
        subject: "For verification mail",
        html:
          "<p>Hii " +
          name +
          ',please click here to <a href="https://harikrishnan.life/forget-password?token=' +
          token +
          '">Reset</a>your password</p>',
        //http://localhost:3000
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("email has been sent ", info.response);
        }
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  // Inserts a new user or admin based on the email.
  insertingUser: async (req, res) => {
    try {
      const spassword = await module.exports.securePassword(req.body.password);
      const verificationCode = generateOtp.generateOTP();
      console.log(verificationCode);
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
          otp: verificationCode,
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
  },

  // Loads the login page.
  loginPageLoad: async (req, res) => {
    try {
      res.render("login");
    } catch (error) {
      console.log(error.message);
      res.redirect("/user-error");
    }
  },

  //loading otp page

  loadingVerifyOtp: async (req, res) => {
    try {
      res.render("otp");
    } catch (error) {
      console.log(error.message);
      res.redirect("/user-error");
    }
  },

  // Verifies user login credentials and handles OTP.
  verifyToLogin: async (req, res) => {
    try {
      const email = req.body.email;
      const password = req.body.password;
      const user = await User.findOne({ email: email });
      console.log(user);
      const verificationCode = user.otp;
      console.log(verificationCode, "verification code");

      console.log(verificationCode);

      if (user) {
        if (user.blocked) {
          res.render("login", {
            message:
              "User is blocked. Please contact the administrator for assistance.",
          });
        } else if (user.is_admin > 0) {
          return res.render("login", { message: "Sorry" });
        } else {
          const passwordMatch = await bcrypt.compare(password, user.password);

          if (passwordMatch) {
            if (user.is_verified === 0) {
              // const otp = await otpController.sendOTP(user.mobile); // Send OTP to the user's mobile number
              const otp = await generateMail(verificationCode, email);
              req.session.user_id = user._id;
              res.render("otp", {
                message: `Please enter the OTP sent to your email- ${email}`,
              });
            } else {
              req.session.user_id = user._id;
              res.redirect("/home");
            }
          } else {
            res.render("login", { message: "Email or password is incorrect" });
          }
        }
      } else {
        res.render("login", { message: "Email or password is incorrect" });
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  // Loads the user's home page.
  loadingUserhome: async (req, res) => {
    try {
      var search = "";

      if (req.query.search) {
        search = req.query.search;
      }
      const products = await Product.find({
        $or: [
          { name: { $regex: ".*" + search + ".*" } },
          { category: { $regex: ".*" + search + ".*" } },
        ],
      });

      const category = await Category.find({ unlist: false });
      const userData = await User.findById({ _id: req.session.user_id });
      console.log(userData, "userData");
      const Banners = await banner.find();
      const wishlistCount = await wishListHelper.getWishListCount(
        req.session.user_id
      );

      let cart = await Cart.findOne({ user: userData._id }).populate(
        "products.productId"
      );

      console.log(cart);
      let cartCount = cart ? cart.products.length : 0;

      if (!cart) {
      }

      res.render("home", {
        user: userData,
        products: products,
        category: category,
        Banners: Banners,
        wishlistCount,
        cartCount,
      });
    } catch (error) {
      res.redirect("/user-error");
      console.log(error, "this error");
    }
  },

  //forgot Verify
  forgotPasswordVerify: async (req, res) => {
    try {
      const email = req.body.email;
      console.log("email Address from forget", email);
      const userData = await User.findOne({ email: email });
      if (userData) {
        if (userData.is_verified == 0) {
          console.log("email is incorrect");
        } else {
          const randomString = randomstring.generate();
          const updatedData = await User.updateOne(
            { email: email },
            { $set: { token: randomString } }
          );
          console.log("updatessdss", updatedData);

          module.exports.sendResetPasswordMail(
            userData.name,
            userData.email,
            randomString
          );
          res.render("login", {
            message: "please check your mail to reset your password",
          });
        }
      } else {
        res.render("login", { message: "mail is incorrect" });
      }
    } catch (error) {
      console.log(error.messge);
    }
  },

  // Logs out the user.
  logoutUser: async (req, res) => {
    try {
      req.session.destroy();
      res.redirect("/");
    } catch (error) {
      console.log(error.message);
    }
  },

  //forget password section  loading forget password page
  forgetPasswordLoad: async (req, res) => {
    try {
      const token = req.query.token;
      console.log("tokeeennnnn", token);
      const tokenData = await User.findOne({ token: token });
      console.log("tokemmm dataaaaaaa", tokenData);
      if (tokenData) {
        res.render("forget-password", { user_id: tokenData._id });
      } else {
        res.render("404", {
          message: "Your token is invalid",
          layout: "user-layout",
        });
      }
    } catch (error) {
      console.log(error.message);
      res.redirect("/user-error");
    }
  },

  //reset Password
  resettingPassword: async (req, res) => {
    try {
      const password = req.body.password;
      const user_id = req.body.user_id;
      const secure_password = await module.exports.securePassword(password);
      const updatedData = await User.findByIdAndUpdate(
        { _id: user_id },
        { $set: { password: secure_password, token: "" } }
      );
      res.redirect("/login");
    } catch (error) {
      console.log(error.message);
      res.redirect("/user-error");
    }
  },

  //Changing password After user Logged In

  changinguserPassword: async (req, res) => {
    try {
      const newPass = req.body.newPass;
      const confPass = req.body.confPass;
      const userId = req.session.user_id;

      if (newPass === confPass) {
        const spassword = await securePassword(confPass);
        console.log(spassword);

        const result = await User.updateOne(
          { _id: userId },
          { $set: { password: spassword } }
        );

        res.redirect("/account");
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  // Loads the index page with products.
  loadingIndexPage: async (req, res) => {
    try {
      var search = "";

      if (req.query.search) {
        search = req.query.search;
      }
      const Banners = await banner.find();

      const products = await Product.find({
        $or: [
          { name: { $regex: ".*" + search + ".*" } },
          { category: { $regex: ".*" + search + ".*" } },
        ],
      });
      let cartCount = 0;

      res.render("index", { products: products, Banners: Banners, cartCount });
    } catch (error) {
      console.log(error.message);
      res.redirect("/user-error");
    }
  },

  // Displays details of a single product.
  // singleProductView: async (req, res) => {
  //   try {
  //     let id = req.query.id;
  //     const productData = await Product.findById({ _id: id });
  //     const wishlistCount = await wishListHelper.getWishListCount(
  //       req.session.user_id
  //     );

  //     const userData = await User.findById({ _id: req.session.user_id });
  //     let cart = await Cart.findOne({ user: userData._id });
  //     let cartCount = cart ? cart.products.length : 0;

  //     if (req.session.user_id) {
  //       res.render("productDetails", {
  //         user: userData,
  //         product: productData,
  //         wishlistCount,
  //         cartCount,
  //       });
  //     } else {
  //       res.render("productDetails", { product: productData, user: null });
  //     }
  //   } catch (error) {
  //     console.log(error,"error")
  //     console.log(error.message);
  //   }
  // },

  singleProductView: async (req, res) => {
    try {
      let id = req.query.id;
      if (!id) {
        return res.status(400).send("Product ID is required");
      }
      const productData = await Product.findById(id);
      if (!productData) {
        return res.status(404).send("Product not found");
      }
      let cartCount = 0;

      if (!req.session.user_id) {
        return res.render("productDetails", {
          product: productData,
          user: null,
          cartCount,
        });
      }

      const userData = await User.findById(req.session.user_id);
      if (!userData) {
        return res.status(404).send("User not found");
      }

      const wishlistCount = await wishListHelper.getWishListCount(
        req.session.user_id
      );

      res.render("productDetails", {
        user: userData,
        product: productData,
        wishlistCount,
        cartCount,
      });
    } catch (error) {
      console.log("Error in singleProductView:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Loads the user's new account page.
  loadingNewaccount: async (req, res) => {
    try {
      const userData = await User.findById({ _id: req.session.user_id });
      const wallet = await Wallet.findOne({ userId: req.session.user_id });

      res.render("Account", { user: userData, wallet: wallet });
    } catch (error) {
      console.log(error.message);
      res.redirect("user-error");
    }
  },

  // Loads user's address page.
  loadingUserAdress: async (req, res) => {
    try {
      const userId = req.session.user_id;
      const userData = await User.findById({ _id: req.session.user_id });
      const userAddress = await Address.findOne({ user_id: userId });

      res.render("userAddresses", {
        user: userData,
        userAddress: await Address.findOne({ user_id: userId }),
      });
    } catch (error) {
      console.log(error.message);
    }
  },

  // Loads the user's account details and orders.
  loadingMyAccount: async (req, res) => {
    try {
      const userId = req.session.user_id;
      const userData = await User.findById({ _id: req.session.user_id });
      const userAddress = await Address.findOne({ user_id: userId });
      const userOrder = await Order.find({ user: userId })
        .populate("items.product")
        .exec();

      res.render("myAccount", {
        user: userData,
        userAddress: userAddress,
        myOders: userOrder,
      });
    } catch (error) {
      console.log(error.message);
    }
  },

  // Adds a new address to the user's account.
  addingAddress: async (req, res) => {
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
      res.redirect("/userAddress");
    } catch (error) {
      console.log(error.message);
    }
  },

  // Deletes an address from the user's account.
  deletingAddress: async (req, res) => {
    try {
      id = req.query.id;
      const userId = req.session.user_id;
      console.log(id);

      await Address.updateOne(
        { user_id: userId },
        { $pull: { address: { _id: id } } }
      );
      res.redirect("/userAddress");
    } catch (error) {
      console.log(error.message);
    }
  },

  // Loads the shop page with products and categories.
  // loadingShop: async (req, res) => {
  //   try {
  //     var search = "";

  //     if (req.query.search) {
  //       search = req.query.search;
  //     }
  //     const category = await Category.find();
  //     const userData = req.session.user_id
  //       ? await User.findById(req.session.user_id)
  //       : null;
  //     const perPage = 6;
  //     const currentPage = req.query.page ? parseInt(req.query.page) : 1;
  //     const wishlistCount = await wishListHelper.getWishListCount(
  //       req.session.user_id
  //     );
  //     let products;

  //     let cart = await Cart.findOne({ user: userData._id }).populate(
  //       "products.productId"
  //     );
  //     let cartCount = cart ? cart.products.length : 0;

  //     if (req.query.category) {
  //       products = await Product.find({ category: req.query.category })
  //         .skip((currentPage - 1) * perPage)
  //         .limit(perPage);
  //     } else {
  //       products = await Product.find({
  //         $or: [
  //           { name: { $regex: ".*" + search + ".*" } },
  //           { category: { $regex: ".*" + search + ".*" } },
  //         ],
  //       })
  //         .skip((currentPage - 1) * perPage)
  //         .limit(perPage);
  //     }

  //     // Sorting
  //     if (req.query.sort === "lowToHigh") {
  //       products.sort((a, b) => a.price - b.price);
  //     } else if (req.query.sort === "highToLow") {
  //       products.sort((a, b) => b.price - a.price);
  //     }

  //     const totalProducts = await Product.countDocuments();
  //     const totalPages = Math.ceil(totalProducts / perPage);

  //     if (userData) {
  //       res.render("shop", {
  //         user: userData,
  //         category: category,
  //         products: products,
  //         req: req,
  //         totalPages: totalPages,
  //         currentPage: currentPage,
  //         totalProducts: totalProducts,
  //         wishlistCount,
  //         cartCount,
  //       });
  //     } else {
  //       res.render("shop", {
  //         category: category,
  //         products: products,
  //         totalPages: totalPages,
  //         currentPage: currentPage,
  //         totalProducts: totalProducts,
  //       });
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     res.redirect("/user-error");
  //   }
  // },

  loadingShop: async (req, res) => {
    try {
      var search = "";

      if (req.query.search) {
        search = req.query.search;
      }
      const category = await Category.find();
      const userData = req.session.user_id
        ? await User.findById(req.session.user_id)
        : null;

      const perPage = 6;
      const currentPage = req.query.page ? parseInt(req.query.page) : 1;
      const wishlistCount = userData
        ? await wishListHelper.getWishListCount(req.session.user_id)
        : 0;

      let products;
      let cartCount = 0;

      if (userData) {
        let cart = await Cart.findOne({ user: userData._id }).populate(
          "products.productId"
        );
        cartCount = cart ? cart.products.length : 0;
      }

      if (req.query.category) {
        products = await Product.find({ category: req.query.category })
          .skip((currentPage - 1) * perPage)
          .limit(perPage);
      } else {
        products = await Product.find({
          $or: [
            { name: { $regex: ".*" + search + ".*" } },
            { category: { $regex: ".*" + search + ".*" } },
          ],
        })
          .skip((currentPage - 1) * perPage)
          .limit(perPage);
      }

      // Sorting
      if (req.query.sort === "lowToHigh") {
        products.sort((a, b) => a.price - b.price);
      } else if (req.query.sort === "highToLow") {
        products.sort((a, b) => b.price - a.price);
      }

      const totalProducts = await Product.countDocuments();
      const totalPages = Math.ceil(totalProducts / perPage);

      const renderData = {
        category: category,
        products: products,
        totalPages: totalPages,
        currentPage: currentPage,
        totalProducts: totalProducts,
        wishlistCount,
        cartCount,
        req:req
      };

      if (userData) {
        renderData.user = userData;
      }

      res.render("shop", renderData,user="");
    } catch (error) {
      console.log(error);
      res.redirect("/user-error");
    }
  },

  // Loads the error page.
  loadingErrorPage: async (req, res) => {
    try {
      const userId = req.session.user_id;
      const userDetails = await User.findOne({ _id: userId });
      res.render("404", { user: userDetails });
    } catch (error) {
      console.log(error.message);
      res.redirect("/user-error");
    }
  },

  loadingCoupons: async (req, res) => {
    try {
      const Coupon = await coupons.find();
      const newCoupon = await newCoupons.find();
      console.log(newCoupon);
      console.log("newCouponsnewCoupons", newCoupons);

      const userData = await User.findById({ _id: req.session.user_id });

      res.render("coupons", {
        user: userData,

        newCoupon,
      });
    } catch (error) {
      console.log(error.message);
    }
  },
};
