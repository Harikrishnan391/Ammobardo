const User = require("../models/userModel");
const wishListModel = require("../models/wishListModel");
const wishListHelper = require("../helpers/wishListHelper");
const Cart = require("../models/cartModel");
const { ObjectId } = require("mongodb");

const loadWishList = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const userData = await User.findById({ _id: req.session.user_id });
    const wishlistCount = await wishListHelper.getWishListCount(userId);

    const wishListProduct = await wishListHelper.getWishListProducts(userId);

    let cart = await Cart.findOne({ user: userData._id });

    let cartCount = cart ? cart.products.length : 0;

    res.render("wishList", {
      user: userData,
      wishListProduct,
      wishlistCount,
      cartCount,
    });
  } catch (error) {
    console.log(error.message);
    res.redirect("/user-error");
  }
};

const addWishList = async (req, res) => {
  try {
    console.log("add to wish listtt");
    let proId = req.body.proId;
    let userId = req.session.user_id;

    let userWishList = await wishListModel.findOne({
      user: new ObjectId(userId),
    });

    const wishlistCount = await wishListHelper.getWishListCount(userId);

    let cart = await Cart.findOne({ user: userId });
    let cartCount = cart ? cart.products.length : 0;

    console.log(userWishList);

    if (userWishList) {
      let productExist = userWishList.wishList.findIndex(
        (wishList) => wishList.productId == proId
      );

      if (productExist != -1) {
        res.send({ status: false });
      } else {
        await wishListModel.updateOne(
          { user: new ObjectId(userId) },
          {
            $push: {
              wishList: { productId: new ObjectId(proId) },
            },
          }
        );
        res.json({ status: true, cartCount, wishlistCount });
      }
    } else {
      let wishListData = {
        user: new ObjectId(userId),
        wishList: [{ productId: new ObjectId(proId) }],
      };
      let newWishList = new wishListModel(wishListData);
      await newWishList.save();

      res.json({ status: true, cartCount, wishlistCount });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ error: error.message });
  }
};

const removeProductWishlist = async (req, res) => {
  const userId = req.session.user_id;

  const proId = req.body.proId;

  wishListHelper.removeProductWishlist(proId, userId).then((response) => {
    res.send(response);
  });
};

module.exports = {
  loadWishList,
  addWishList,
  removeProductWishlist,
};
