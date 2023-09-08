const Order= require('../models/orderModel')
const User=require("../models/userModel")
const { ObjectId } = require("mongodb");



  

const getSalesReport = () => {
    try {
      return new Promise((resolve, reject) => {
        Order.aggregate([
          {
            $unwind: "$items",
          },
          {
            $match: {

                "status": "Delivered",
            },
          },
        ]).then((response) => {
          resolve(response);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  };


  const postReport = (date) => {
    console.log(date, "date+++++");
    try {
      const start = new Date(date.startdate);
      const end = new Date(date.enddate);
      return new Promise((resolve, reject) => {
        Order.aggregate([
          {
            $unwind: "$items",
          },
          {
            $match: {
              $and: [
                { "status": "Delivered" },
                {
                  "items.createdAt": {
                    $gte: start,
                    $lte: new Date(end.getTime() + 86400000),
                  },
                },
              ],
            },
          },
        ])
          .exec()
          .then((response) => {
            console.log(response, "response---");
            resolve(response);
          });
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  


module.exports={

 getSalesReport,
 postReport,

}