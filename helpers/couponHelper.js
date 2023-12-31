const voucherCode = require("voucher-code-generator");
const Coupon = require("../models/couponModel");
const User = require("../models/userModel");
const { error } = require("console");


const generateCouponCode = () => {
    return new Promise((resolve, reject) => {
      let couponCode = voucherCode.generate({
        length: 6,
        count: 1,
        charset: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        prefix: "Mobardo-",
      });
  
      if (couponCode) {
        console.log(couponCode);
  
        resolve({ status: true, couponCode: couponCode[0] });
      } else {
        reject(error);
      }
    });
  };


const addCouponData = async (data) => {
    try {
      const coupon = await Coupon.findOne({ couponCode: data.couponCode });
      if (coupon) {
        return { status: false };
      } else {
        const response = await new Coupon(data).save();
        return { status: true };
      }
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  };


  const verifyCouponData = async (couponCode, userId) => {
    try {
      console.log(userId);
      const couponExist = await Coupon.find({ couponCode: couponCode });
      console.log(couponExist);
  
      if (couponExist.length > 0) {
        console.log("coupon exist");
  
        if (couponExist[0].validity - new Date() <= 0) {
          return { status: false, message: "Coupon Has Expired" };
          console.log("Coupon Has Expired");
        } else {
          const usersCoupon = await User.findOne({
            _id: userId,
            coupons: { $elemMatch: { $eq: couponCode } },
          });
  
          console.log("usersCoupon", usersCoupon);
          if (usersCoupon) {
            console.log("This coupon is  already used");
            return { status: false, message: "This coupon is  already used" };
          } else {
            console.log("Coupon not used yet");
            return { status: true, message: "Coupon added successfully" };
          }
        }
      } else {
        console.log("coupon not exist");
        return { status: false, message: "coupon not exist" };
      }
    } catch (error) {
      console.log(error.message);
    }
  };



   //apply coupon

const applyCoupon = async (userId, subTotal, couponCode) => {
    try {
      const coupon = await Coupon.findOne({ couponCode: couponCode });
      console.log(coupon);
      if (coupon) {
        if (subTotal < coupon.minPurchase) {
          return {
            status: false,
            message: `minimum purchase amount is ${coupon.minPurchase}`,
          };
        } else {
          let discountAmount = (subTotal * coupon.minDiscountPercentage) / 100;
          console.log('discountAmountddhdhd',discountAmount)
          if (discountAmount > coupon.maxDiscountValue) {
            discountAmount = coupon.maxDiscountValue;
          }
  
          return {
            subTotal: subTotal,
            status: true,
            discountAmount: discountAmount,
            discount: coupon.minDiscountPercentage,
            couponCode: couponCode,
          };
        }
      }
    } catch (error) {
      console.log(error.message);
      throw new Error("An error occurred while applying the coupon.");
    }
  };


 






module.exports={

    generateCouponCode,
    addCouponData,
    verifyCouponData,
    applyCoupon,
  
}
