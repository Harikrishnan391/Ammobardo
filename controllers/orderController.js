const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Product = require("../models/productsModel");
const Address = require("../models/addressModel");
const Order = require("../models/orderModel");
const orderHelper = require("../helpers/orderHelper");
const couponHelpers = require("../helpers/couponHelperN");
const Razorpay = require("razorpay");
require("dotenv").config();

// var instance = new Razorpay({
//     key_id: 'rzp_test_UMG6OCOYYtU8fY',
//     key_secret: 'gOp1QVvj8IWNoCBJAASMuN1C',
//   });
var instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

const placeOrder = async (req, res) => {
  try {
    let userId = req.session.user_id;

    let orderDetails = req.body;

    console.log("This is Order Detailssss", orderDetails);

    let orderedProducts = await orderHelper.getProductListForOrders(userId);

    console.log('orderedProducts',orderedProducts);

    if (orderedProducts) {

      for (const orderedProduct of orderedProducts) {
        const productId = orderedProduct.product;
        const quantityOrdered = orderedProduct.quantity;
        console.log('productId', productId);
      
        // Find the product by ID
        const product = await Product.findById(productId);
      
        if (!product) {
          // Product not found, handle error
          throw new Error(`Product with ID ${productId} not found.`);
        }
      
        // Calculate the new stock after decrementing
        const newStock = product.stock - quantityOrdered;
      
        // Ensure the stock doesn't go below 0
        product.stock = Math.max(0, newStock);
      
        // Save the updated product
        const updatedProduct = await product.save();
      
        if (updatedProduct.stock < 0) {
          // Insufficient stock, handle error
          throw new Error(`Insufficient stock for product ${productId}.`);
        }
      }
      let totalOrderValue = await orderHelper.getCartValue(userId);

      console.log("totalOrderValueeee", totalOrderValue);

      const availableCouponData =
        await couponHelpers.checkCurrentCouponValidityStatus(
          userId,
          totalOrderValue
        );

      console.log("availableCouponDataaaaaaaaaaaa", availableCouponData);

      let couponDiscountAmount = 0;

      if (availableCouponData.status) {
        const couponDiscountAmount = availableCouponData.couponDiscount;
        // Inserting the value of coupon discount into the order details object created above
        orderDetails.couponDiscount = couponDiscountAmount;

        // Updating the total order value with coupon discount applied
        totalOrderValue -= couponDiscountAmount;
        const updateCouponUsedStatusResult =
          await couponHelpers.updateCouponUsedStatus(
            userId,
            availableCouponData.couponId
          );

        console.log("after Discount", totalOrderValue);
      }
      if (req.body["paymentMethod"] === "COD") {
        orderHelper
          .placingOrder(userId, orderDetails, orderedProducts, totalOrderValue)
          .then(async (orderId, error) => {
            res.json({ COD_CHECKOUT: true });
          });
      } else if (req.body["paymentMethod"] === "WALLET") {
        const walletBalance = await orderHelper.walletBalance(userId);
        if (walletBalance.walletAmount >= totalOrderValue) {
          orderHelper
            .placingOrder(
              userId,
              orderDetails,
              orderedProducts,
              totalOrderValue
            )
            .then(async (orderId, error) => {
              res.json({ WALLET_CHECKOUT: true, orderId });
            });
        } else {
          res.json({ error: "Insufficient balance." });
        }
      } else if (req.body["paymentMethod"] === "ONLINE") {
        orderHelper
          .placingOrder(userId, orderDetails, orderedProducts, totalOrderValue)
          .then(async (orderId, error) => {
            // console.log('Ordercontroller',orderId)

            if (error) {
              res.json({ chekoutStatus: false });
            } else {
              orderHelper
                .generateRazorpayOrder(orderId, totalOrderValue)
                .then(async (razorpayOrderDetails, err) => {
                  // console.log('RZPY orderDetails',razorpayOrderDetails)

                  const user = await User.findById({ _id: userId }).lean();

                  res.json({
                    ONLINE_CHECKOUT: true,
                    userDetails: user,
                    userOrderRequestData: orderDetails,
                    orderDetails: razorpayOrderDetails,
                    razorpayKeyId: process.env.KEY_ID,
                  });
                });
            }
          });
      }
    } else {
      res.json({ paymentStatus: false });
    }
  } catch (error) {
    console.log(error.message);
    res.redirect('/user-error')
  }
};

const verifyPayment = async (req, res) => {
  orderHelper
    .verifyOnlinePayment(req.body)
    .then(() => {
      console.log("request.body  ", req.body);

      //  let receiptId = req.body['serverOrderDetails[receipt]'];
      let receiptId = req.body.serverOrderDetails.receipt;

      console.log(receiptId);

      let paymentSuccess = true;
      orderHelper
        .updateOnlineOrderPaymentStatus(receiptId, paymentSuccess)
        .then(() => {
          // Sending the receiptId to the above userHelper to modify the order status in the DB
          // We have set the Receipt Id is same as the orders cart collection ID

          res.json({ status: true });
        });
    })
    .catch((err) => {
      if (err) {
        console.log(err.message);

        let paymentSuccess = false;
        orderHelper
          .updateOnlineOrderPaymentStatus(receiptId, paymentSuccess)
          .then(() => {
            // Sending the receiptId to the above userHelper to modify the order status in the DB
            // We have set the Receipt Id is same as the orders cart collection ID

            res.json({ status: false });
          });
      }
    });
};

const walletOrder = async (req, res) => {
  try {
    const orderId = req.query.id;
    console.log(orderId, "orderIddddd");
    const userId = req.session.user_id;
    const updatingWallet = await orderHelper.updateWallet(userId, orderId);
    res.redirect("/orderSucessfull");
  } catch (error) {
    console.log(error.message);
    res.redirect("/user-error");
  }
};

const OrderList = async (req, res) => {
  try {
    const Orders = await Order.find();

    res.render("OrderList", { userOrder: Orders });
  } catch (error) {
    console.log(error.message);
  }
};

const orderDetails = async (req, res) => {
  try {
    const id = req.query.id;
    const userOrder = await Order.findById({ _id: id })
      .populate("items.product")
      .exec();
    res.render("orderDetails", { order: userOrder });
  } catch (error) {
    console.log(error.message);
  }
};

const cancelOrder = async (req, res) => {
  const orderId = req.query.orderId;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update the order status to "Order Cancelled"
    order.status = "Order Cancelled";
    await order.save();

    return res.redirect("/account"); // Redirect back to user's order list
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Error cancelling order" });
  }
};

const updateOrderStatus = async (req, res) => {
  const { id, status } = req.query;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update the order status
    order.status = status;
    await order.save();

    return res.redirect("/admin/orderList"); // Redirect back to order list page
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Error updating order status" });
  }
};

const requestReturn = async (req, res) => {
  const orderId = req.query.orderId;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update the order status to "Requested Return"
    order.status = "Requested Return";
    await order.save();

    return res.redirect("/prodfileOrderList"); // Redirect back to user's order list
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Error requesting return" });
  }
};

// const acceptReturn=async(req,res)=>{

//     try {

//         id=req.query.id
//        const order=await Order.findById(id)

//        order.status='Returned'

//        await order.save()

//         res.redirect('/admin/OrderList')
//     } catch (error) {

//         console.log(error.message)
//     }
// }

const declineReturn = async (req, res) => {
  try {
    const order = await Order.findById(id);

    id = req.query.id;

    order.status = "Return declined";

    await order.save();
    res.redirect("/admin/OrderList");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  OrderList,
  orderDetails,
  updateOrderStatus,
  cancelOrder,
  requestReturn,
  declineReturn,
  placeOrder,
  verifyPayment,
  walletOrder,
};
