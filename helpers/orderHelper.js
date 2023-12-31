const Cart=require('../models/cartModel')
const User=require('../models/userModel')
const Product=require('../models/productsModel')
const Address=require('../models/addressModel')
const Order= require('../models/orderModel')
const { Reject } = require('twilio/lib/twiml/VoiceResponse')
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Wallet = require('../models/walletModel')

var instance = new Razorpay({
    key_id: 'rzp_test_UMG6OCOYYtU8fY',
    key_secret:'gOp1QVvj8IWNoCBJAASMuN1C',
  });
  

module.exports={


    getProductListForOrders:async(userId)=>{

        return new Promise(async(resolve,reject)=>{

            try{
                const ProductDetails=await Cart.findOne({user:userId}).lean()
                
                console.log("Product Details",ProductDetails)


                const subtotal=ProductDetails.products.reduce((acc,product)=>{
    
                    return acc+product.subtotal;
                },0);
    
                const products=ProductDetails.products.map((product)=>({
    
                    product:product.productId,
                    quantity:product.quantity,
                    price:product.subtotal
    
                }))
                

                if(products){
    
                    resolve(products)
                }
                else{
    
                    resolve(false)
                }

            }
            catch(error){

                reject(error)
            }
     
        })
    },


    getCartValue: (userId) => {

        return new Promise(async (resolve, reject) => {
            try {
                const productDetails = await Cart.findOne({ user: userId }).lean();
    
                // Calculate the new subtotal for all products in the cart
                const subtotal = productDetails.products.reduce((acc, product) => {
                    return acc + product.subtotal;
                }, 0);
    
                if (subtotal) {
                    resolve(subtotal)
                } else {
                    resolve(false);
                }
            } catch (error) {
                reject(error)
            }
           
        })
    },
    

    placingOrder: async (userId, orderData, orderedProducts, totalOrderValue ) => {
        return new Promise(async (resolve, reject)=>{
            try {

                let orderStatus
                console.log('Ordered Producttss',orderedProducts)
    
                if (orderData['paymentMethod'] === 'COD') {
                    orderStatus = 'Placed'
                } 
                else if (orderData['paymentMethod'] === 'WALLET') {
                    orderStatus = 'Placed'
                }
                else {
                    orderStatus = 'Pending'
                }
                // Calculate the total quantity of ordered products
                 let totalQuantity = orderedProducts.reduce((total, product) => total + product.quantity, 0);
                console.log('orderrrr dataaaaaa',orderData)
                const orderDetails = new Order({
                    user: userId,
                    date: Date(),
                    orderValue: totalOrderValue,
                    // couponDiscount: orderData.couponDiscount,
                    paymentMethod:orderData['paymentMethod'],
                    status: orderStatus,
                    items: orderedProducts,
                    addressDetails: orderData,
                    total:totalOrderValue,
                    totalQuantity:totalQuantity
                });
        
                const placedOrder = await orderDetails.save();
        
                // console.log(placedOrder, 'placedOrder');
        
                // Remove the products from the cart
                await Cart.deleteMany({ user: userId });
        
                let dbOrderId = placedOrder._id.toString();
                console.log(dbOrderId, 'order id in stringggggggggggg');
                
                resolve(dbOrderId)
            } catch (error) {
                reject(error)
            }
        })

    },



    generateRazorpayOrder: (orderId, totalOrderValue) => {
        orderValue = totalOrderValue*100
        
        return new Promise((resolve, reject) => {
            try {
                let orderDetails = {
                    amount: orderValue,
                    currency: "INR",
                    receipt: orderId
                };
    
                instance.orders.create(orderDetails, function (err,orderDetails ) {


                    if (err) {
                        console.log('Order Creation Error from Razorpay: ' + err);
                        reject(err);
                    } else {
                        resolve(orderDetails);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    },


    // verifyOnlinePayment: (paymentData) => {

    //     console.log('payment Data',paymentData);

    //     return new Promise((resolve, reject) => {                                           

    //         try {
    //             const crypto = require('crypto'); // Requiring crypto Module here for generating server signature for payments verification

    //             let razorpaySecretKey ='gOp1QVvj8IWNoCBJAASMuN1C';
    
    //             let hmac = crypto.createHmac('sha256',razorpaySecretKey); // Hashing Razorpay secret key using SHA-256 Algorithm

    //             console.log(hmac)
                 
    //             hmac.update(paymentData['razorpayServerPaymentResponse[razorpay_order_id]'] + '|' + paymentData['razorpayServerPaymentResponse[razorpay_payment_id]']);

    //             // Updating the hash (re-hashing) by adding Razprpay payment Id and order Id received from client as response
    
    //             let serverGeneratedSignature = hmac.digest('hex');


    //             console.log('signature from server  ',serverGeneratedSignature)

    //             // Converted the final hashed result into hexa code and saving it as server generated signature
    //             let razorpayServerGeneratedSignatureFromClient = paymentData['razorpayServerPaymentResponse[razorpay_signature]']
    
    //             if (serverGeneratedSignature === razorpayServerGeneratedSignatureFromClient) {
    //                 // Checking that is the signature generated in our server using the secret key we obtained by hashing secretkey,orderId & paymentId is same as the signature sent by the server 
    
    //                 console.log("Payment Signature Verified");
    
    //                 resolve()
    
    //             } else {
    
    //                 console.log("Payment Signature Verification Failed");
    
    //                 reject()
    
    //             }
    //         } catch (error) {
    //             reject(error)
    //         }

    //     })

    // },

    verifyOnlinePayment: (paymentData) => {

        console.log('paymen Data-->',paymentData)

        return new Promise((resolve, reject) => {
            try {
                const crypto = require('crypto');
                const razorpaySecretKey = 'gOp1QVvj8IWNoCBJAASMuN1C';
                
                const hmac = crypto.createHmac('sha256', razorpaySecretKey);
    
                const order_id = paymentData.razorpayServerPaymentResponse.razorpay_order_id;
                const payment_id = paymentData.razorpayServerPaymentResponse.razorpay_payment_id;
    
                hmac.update(order_id + '|' + payment_id);
                
                const serverGeneratedSignature = hmac.digest('hex');
                
                const razorpayServerGeneratedSignatureFromClient = paymentData.razorpayServerPaymentResponse.razorpay_signature;
                
                if (serverGeneratedSignature === razorpayServerGeneratedSignatureFromClient) {
                    console.log("Payment Signature Verified");
                    resolve();
                } else {
                    console.log("Payment Signature Verification Failed");
                    reject();
                }
            } catch (error) {
                reject(error);
            }
        });
    },
    


    updateOnlineOrderPaymentStatus: (ordersCollectionId, onlinePaymentStatus) => {
        return new Promise(async (resolve, reject) => {
            try {
                if (onlinePaymentStatus) {
                    const orderUpdate = await Order.findByIdAndUpdate({ _id: new ObjectId(ordersCollectionId) }, { $set: { status: "Placed" } }).then(() => {
                        resolve()
                    });
    
                } else {
                    const orderUpdate = await Order.findByIdAndUpdate({ _id: new ObjectId(ordersCollectionId) }, { $set: { status: "Failed" } }).then(() => {
                        resolve()
                    })
                }
            } catch (error) {
                reject(error)
            }
           
        })
    },

    
    walletBalance: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const walletBalance = await Wallet.findOne({ userId: userId })
                resolve(walletBalance)
            } catch (error) {
                reject(error)

            }
        })
    },

    updateWallet: (userId, orderId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const orderDetails = await Order.findOne({ _id: orderId });
                console.log(orderDetails)
                const wallet = await Wallet.findOne({ userId: userId });

                if (wallet) {
                    // Subtract orderValue from walletAmount
                    const updatedWalletAmount = wallet.walletAmount - orderDetails.total;

                    // Update the walletAmount in the Wallet collection
                    await Wallet.findOneAndUpdate(
                        { userId: userId },
                        { walletAmount: updatedWalletAmount }
                    );

                    resolve(updatedWalletAmount);
                } else {
                    reject('Wallet not found');
                }
            } catch (error) {
                reject(error);
            }
        });
    },



   

}