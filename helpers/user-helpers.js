const db = require("../configaration/connection");
const userModel = require("../model/user-schema");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const moment = require("moment");
var productModel = require("../model/product-schema");
const cartModel = require("../model/cart-schema");
const wishlistModel = require("../model/wishlist-schema");
const addressModel = require("../model/address-schema");
const orderModel = require("../model/order-schema");
const Mongoose = require("mongoose");
const Razorpay = require("razorpay");
const { resolve } = require("path");
let instance = new Razorpay({
  key_id: "rzp_test_71eRwcGz4vx5LP",
  key_secret: "caCxVeYSYY6SwbEJ93rdZabA",
});

module.exports = {
  dosignup: (data) => {
    return new Promise(async (resolve, reject) => {
      const user = await userModel.findOne({ Email: data.Email });
      if (user) {
        reject({ msge: "user with this email exist" });
      } else {
        const otpCode = Math.floor(1000 + Math.random() * 8999);
        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "sahadmohammedclr@gmail.com",
            pass: "jafndhgpmzhitysg",
          },
        });

        let otpCode1 = {
          from: "sahadmohammedclr@gmail.com",
          to: data.Email,
          subject: "mail using node mailer",
          text: "your verification code " + otpCode,
        };
        transporter.sendMail(otpCode1, function (error, info) {
          if (error) reject({ msg: "msg not sent" });
          // console.log(info);
          // console.log("mail sent successfully");
          resolve({ msg: "success", otpCode });
        });
      }
    });
  },
  otpverify: (otpData, otpCode, data) => {
    // console.log(data);
    return new Promise(async (resolve, reject) => {
      const userOtp = otpData.otp1 + otpData.otp2 + otpData.otp3 + otpData.otp4;
      if (otpCode == userOtp) {
        const Password = await bcrypt.hash(data.Password, 10);

        const newuser = new userModel({
          Name: data.Name,
          Email: data.Email,
          Number: data.Phone_Number,
          Password: Password,
        });
        await newuser.save();
        resolve({ status: true });
      } else {
        reject({ status: false, msg: "otp verification failed" });
      }
    });
  },

  doLogin: (data) => {
    // console.log(data);
    // let status=false
    let response = {};
    return new Promise(async (resolve, reject) => {
      const user = await userModel.findOne({ Email: data.Email });

      if (user) {
        bcrypt.compare(data.Password, user.Password).then((status) => {
          if (status) {
            response.user = user;
            response.status = true;
            response.userBlock = user.block;
            resolve(response);
          } else {
            reject({ status: false, msg: "incorrect password" });
          }
        });
      } else {
        reject({ status: false });
      }
    });
  },

  forgotpassword: (data) => {
    return new Promise(async (resolve, reject) => {
      // console.log(data);
      const user = await userModel.findOne({ Email: data.Email });
      if (user) {
        // -------------------------------------------------
        const forgotCode = Math.floor(1000 + Math.random() * 8999);
        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "sahadmohammedclr@gmail.com",
            pass: "jafndhgpmzhitysg",
          },
        });

        let mailDetails = {
          from: "sahadmohammedclr@gmail.com",
          to: data.Email,
          subject: "forgot password",
          text: "your verification code " + forgotCode,
        };
        transporter.sendMail(mailDetails, function (error, info) {
          if (error) reject({ msg: "msg not sent" });
          // console.log(info);
          // console.log("mail sent successfully");
          resolve({ msg: "success", forgotCode });
        });
      } else {
        reject({ status: false, msg: "Enter a valid email" });
      }
    });
  },

  forgetOtpVerify: (otpData, otpCode, data) => {
    // console.log(data);
    return new Promise(async (resolve, reject) => {
      const forgotOtp =
        otpData.otp1 + otpData.otp2 + otpData.otp3 + otpData.otp4;
      // console.log(otpCode);
      if (otpCode == forgotOtp) {
        resolve({ status: true });
      } else {
        reject({ status: false, msg: "otp verification failed" });
      }
    });
  },

  SetnewPassword: (data, id) => {
    // console.log(id);
    return new Promise(async (resolve, reject) => {
      if (data.Password == data.cPassword) {
        if (data.Password.length < 6) {
          reject({ msg: "password is short" });
        } else {
          console.log("true");
          const rePassword = await bcrypt.hash(data.Password, 10);
          // console.log(rePassword);
          await userModel.findOneAndUpdate(
            { Email: id },
            { $set: { Password: rePassword } }
          );
          resolve({ status: true });
        }
      } else {
        reject({ status: false, msg: "password not match" });
      }
    });
  },

  addToCart: (proId, userId) => {
    // console.log(proId);
    // console.log(userId);
    return new Promise(async (resolve, reject) => {
      const cart = await cartModel.findOne({ user_Id: userId });
      const product = await productModel.findOne({ _id: proId });
      if (cart) {
        const proExist = cart.products.findIndex(
          (products) => products.productId == proId
        );
        // console.log(proExist);
        if (proExist != -1) {
          resolve({ error: "product already in Cart" });
        } else {
          await cartModel
            .findOneAndUpdate(
              { user_Id: userId },
              {
                $push: { products: { productId: proId, price: product.price } },
              }
            )
            .then(async (res) => {
              // console.log(res);
              resolve({ msg: "Added", count: res.products.length + 1 });
            });
        }
      } else {
        const newwishlist = new cartModel({
          user_Id: userId,
          products: { productId: proId, price: product.price },
        });
        await newwishlist.save((err, result) => {
          if (err) {
            resolve({ msg: "Not added to Cart" });
          } else {
            resolve({ msg: "Cart created" });
          }
        });
      }
    });
  },
  getCartItems: (userId) => {
    return new Promise(async (resolve, reject) => {
      const products = await cartModel
        .findOne({ user_Id: userId })
        .populate("products.productId")
        .lean();

      //console.log(products);
      resolve(products);
    });
  },
  deleteCartProduct: (product_Id, user) => {
    // console.log(product_Id);
    // console.log(user);
    return new Promise(async (resolve, reject) => {
      await cartModel
        .findOneAndUpdate(
          { user_Id: user._id },
          { $pull: { products: { productId: product_Id } } }
        )
        .then((response) => {
          resolve(response);
          // console.log(response);
        });
    });
  },
  getCartProductCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await cartModel.findOne({ user_Id: userId });
      if (cart) {
        count = cart.products.length;
      }
      resolve(count);
    });
  },
  changeProductQuantity: ({ cart, product, count, quantity }, userId) => {
    return new Promise(async (resolve, reject) => {
      // console.log(userId + " change Quantity");
      if (count == -1 && quantity == 1) {
        await cartModel
          .findOneAndUpdate(
            { "products._id": cart },
            { $pull: { products: { productId: product } } }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        await cartModel
          .updateOne(
            { "products._id": cart, "products.productId": product },
            { $inc: { "products.$.quantity": count } }
          )

          .then((response) => {
            resolve(true);
          });
      }
    });
  },
  getSubTotalAmount: (userId) => {
    let id = Mongoose.Types.ObjectId(userId);
    return new Promise(async (resolve, reject) => {
      let cart = await cartModel.aggregate([
        {
          $match: { user_Id: id },
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            Id: "$products.productId",
            total: { $multiply: ["$products.price", "$products.quantity"] },
          },
        },
      ]);
      console.log(cart);
      const carts = await cartModel.findOne({ user_Id: userId });
      if (carts) {
        cart.forEach(async (amt) => {
          await cartModel.updateMany(
            { "products.productId": amt.Id },
            { $set: { "products.$.subtotal": amt.total } }
          );
        });
      }
      resolve();
    });
  },
  getGrandTotal: (userId) => {
    let id = Mongoose.Types.ObjectId(userId);
    return new Promise(async (resolve, reject) => {
      let total = await cartModel.aggregate([
        {
          $match: { user_Id: id },
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            quantity: "$products.quantity",
            price: "$products.price",
          },
        },
        // {
        //   $project: {
        //     name: 1,
        //     quantity: 1,
        //     price: 1,
        //   },
        // },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ["$quantity", "$price"] } },
          },
        },
      ]);
      if (total.length == 0) {
        resolve({ status: true });
      } else {
        let grandTotal = total.pop();
        console.log(grandTotal, "cart Total");
        await cartModel.findOneAndUpdate(
          { user_Id: id },
          { $set: { total: grandTotal.total } }
        );
        resolve(grandTotal);
        console.log(grandTotal, "Resolve");
      }
    });
  },
  addToWishlist: (proId, userId) => {
    // console.log(proId);
    // console.log(userId);
    return new Promise(async (resolve, reject) => {
      const wishlist = await wishlistModel.findOne({ user_Id: userId });
      if (wishlist) {
        const proExist = wishlist.products.findIndex(
          (products) => products.productId == proId
        );
        // console.log(proExist);
        if (proExist != -1) {
          resolve({ error: "product already in wishlist" });
        } else {
          await wishlistModel
            .findOneAndUpdate(
              { user_Id: userId },
              { $push: { products: { productId: proId } } }
            )
            .then(async (res) => {
              // console.log(res);
              resolve({ msg: "Added", count: res.products.length + 1 });
            });
        }
      } else {
        const newwishlist = new wishlistModel({
          user_Id: userId,
          products: { productId: proId },
        });
        await newwishlist.save((err, result) => {
          if (err) {
            resolve({ msg: "Not added to wishlist" });
          } else {
            resolve({ msg: "wishlist created" });
          }
        });
      }
    });
  },
  getWishList: (userId) => {
    return new Promise(async (resolve, reject) => {
      const products = await wishlistModel
        .findOne({ user_Id: userId })
        .populate("products.productId")
        .lean();

      // console.log(products);
      resolve(products);
    });
  },
  changeWishlistButton: (product) => {
    return new Promise(async (resolve, reject) => {
      await productModel.findByIdAndUpdate(
        { _id: product },
        { $set: { wishlist: true } }
      );
      resolve();
    });
  },
  changeWishlistAddButton: (productId) => {
    return new Promise(async (resolve, reject) => {
      await productModel.findByIdAndUpdate(
        { _id: productId },
        { $set: { wishlist: false } }
      );
      resolve();
    });
  },
  deleteWishProduct: (product_Id, user) => {
    // console.log(product_Id);
    // console.log(user);
    return new Promise(async (resolve, reject) => {
      await wishlistModel
        .findOneAndUpdate(
          { user_Id: user._id },
          { $pull: { products: { productId: product_Id } } }
        )
        .then((response) => {
          resolve(response);
          // console.log(response);
        });
    });
  },
  getWishProductCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let wishList = await wishlistModel.findOne({ user_Id: userId });
      if (wishList) {
        count = wishList.products.length;
      }
      resolve(count);
    });
  },

  getUserDetails: (user) => {
    // console.log(user);
    return new Promise(async (resolve, reject) => {
      const userDetailes = await userModel
        .findOne({ Email: user.Email })
        .lean();
      resolve(userDetailes);
      // console.log("user data");
      // console.log(userDetailes);
    });
  },
  addAddress: (address) => {
    // console.log(address);
    return new Promise(async (resolve, reject) => {
      let exitAdress = await userModel.findOneAndUpdate(
        { Email: address.Email },
        {
          $set: {
            Name: address.Name,
            Email: address.Email,
            Number: address.Number,
            Address: address.Address,
            City: address.City,
            Zip: address.Zip,
            State: address.State,
            Country: address.Country,
          },
        }
      );
      // console.log(exitAdress ,"Exit");
      resolve(exitAdress);
    });
  },
  getUserAddress: (userMail) => {
    // console.log(userMail);
    return new Promise((resolve, reject) => {
      let exitUser = userModel.findOne({ Email: userMail.Email }).lean();
      // console.log(exitUser);
      resolve(exitUser);
    });
  },
  addShippindAddress: (addressData, userId) => {
    return new Promise(async (resolve, reject) => {
      const newAddress = new addressModel({
        user_Id: userId,
        Name: addressData.Name,
        Number: addressData.Number,
        Address: addressData.Address,
        Pincode: addressData.Pincode,
        City: addressData.City,
        State: addressData.State,
        Country: addressData.Country,
      });
      await newAddress.save((err, result) => {
        if (err) {
          reject({ msg: "address not added" });
        } else {
          resolve({ msg: "address added" });
        }
      });
    });
  },
  getNewAddress: (user) => {
    // console.log(user);
    return new Promise(async (resolve, reject) => {
      const newAddress = await addressModel.find({ user_Id: user._id }).lean();
      // console.log("new Address");
      //  console.log(newAddress);
      resolve(newAddress);
    });
  },
  getCheckoutAddress: (userId) => {
    return new Promise(async (resolve, reject) => {
      const checkOutAddress = await addressModel
        .findById({ _id: userId })
        .lean();
      resolve(checkOutAddress);
    });
  },
  placeOrder: (userId, order, products, grandTotal, selectedAddress) => {
    let product = products.products;
    // console.log(product,'order Product');
    return new Promise(async (resolve, reject) => {
      let status = order["payment"] === "COD" ? "placed" : "pending";
      console.log(status);
      var todayDateFormat = moment(Date.now).format("ddd MMM DD YYYY");
      let newOrder = new orderModel({
        user_Id: userId,
        payment_Method: order["payment"],
        products: product,
        grandTotal: grandTotal.total,
        ordered_on: todayDateFormat,
        shippingAddress: selectedAddress,
        status: status,
      });

      await newOrder.save(async (err, result) => {
        if (err) {
          resolve({ error: "order not placed" });
          console.log("order not placed");
        } else {
          await cartModel.remove({ user_Id: userId });
          resolve({ msg: "order placed successfully", orderId: newOrder._id });
          console.log("order placed successfully");
        }
      });
    });
  },
  getSelectedAddress: (userId) => {
    return new Promise(async (resolve, reject) => {
      const address = await addressModel.findOne({ ud: userId, status: true });
      //  console.log("address:"+address);
      resolve(address);
    });
  },
  selectAddedAddress: (addressId) => {
    return new Promise(async (resolve, reject) => {
      //  const address = addressModel.findOne({_id:addressId})

      const address = await addressModel.updateMany(
        {},
        { $set: { status: false } }
      );
      console.log(address);
      if (address) {
        await addressModel.findOneAndUpdate(
          { _id: addressId },
          { $set: { status: true } }
        );
        resolve({ msg: "address selected" });
      } else {
        resolve({ msg: "address not selected" });
      }
    });
  },
  generateRazorpay: (orderId, grandTotal) => {
    console.log(grandTotal);
    console.log(orderId);
    return new Promise(async (resolve, reject) => {
      let options = {
        amount: grandTotal * 100,
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        //    console.log("new Order : ",order);
        resolve(order);
      });
    });
  },
  verifyPayment: (paymentDetails) => {
    return new Promise(async (resolve, reject) => {
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "caCxVeYSYY6SwbEJ93rdZabA");
      hmac.update(
        paymentDetails["payment[razorpay_order_id]"] +
          "|" +
          paymentDetails["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      if (hmac == paymentDetails["payment[razorpay_signature]"]) {
        resolve();
      } else {
        reject();
      }
    });
  },
  changePaymentStatus: (orderId) => {
    return new Promise(async (resolve, reject) => {
      await orderModel
        .updateOne(
          { _id: orderId },
          {
            $set: {
              status: "placed",
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  getOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      const orders = orderModel.find({ user_Id: userId }).lean();
      resolve(orders);
    });
  },
  getOrderConfirm: () => {
    return new Promise(async (resolve, reject) => {
      const shippingAddress = await addressModel
        .findOne({ status: true })
        .lean();
      resolve(shippingAddress);
      // console.log(shippingAddress);
    });
  },
  getOrderSummary: (orderId) => {
    return new Promise(async (resolve, reject) => {
      const orderSummary = await orderModel.findOne({ _id: orderId }).lean();
      resolve(orderSummary);
    });
  },
  getOrderedProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      const order = await orderModel
        .findOne({ _id: orderId })
        .populate("products.productId")
        .lean();
      resolve(order);
    });
  },
  orderCancelled: (orderId) => {
    // console.log("Cancelled");
    // console.log(orderId);
    return new Promise(async (resolve, reject) => {
      await orderModel.findByIdAndUpdate(
        { _id: orderId },
        { $set: { cancel: true } }
      );
      resolve();
    });
  },
  getallProucts: () => {
    return new Promise(async (resolve, reject) => {
      console.log("search");
      let products = await productModel.find({}).lean();
      resolve(products);
    });
  },
  getCategoryItems: (user_category) => {
    console.log(user_category);
    return new Promise(async (resolve, reject) => {
      let products = await productModel
        .find({ category: user_category })
        .lean();
      console.log(products);
      resolve(products);
    });
  },
  // settingPassword :(data,id)=>{
  // return new Promise(async(resolve,reject)=>{
  //    const user=await Model.findOne({Email:id})
  //    if(user){
  //         if(user.Password==data.Password){
  //                 if(data.Password==data.cPassword){
  //                             if(data.newPassword.length<4){
  //                                 reject({msg:'password is tooshort'})
  //                             }else{
  //                             await Model.findOneAndUpdate({Email:id},{$set:{Password:data.Password}})
  //                                 resolve()
  //                             }
  //                 }else{
  //                     reject({msg:'new password and confirm password are not match'})
  //                 }
  //         }else{
  //             reject({msg:'current password is not match'})
  //         }
  //    }else{
  //        reject({msg:'something went wrong'})
  //    }
  // })
};
