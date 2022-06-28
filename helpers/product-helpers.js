var db = require("../configaration/connection");
var userModel = require("../model/user-schema");
var productModel = require("../model/product-schema");
var cartModel = require("../model/cart-schema");

module.exports = {
  getProduct: () => {
    return new Promise(async (resolve, reject) => {
      const product = await productModel
        .find({})
        .sort({ _id: -1 })
        .limit(8)
        .lean();
      resolve(product);
      //    console.log(product);
    });
  },

  getViewProduct: (view_id) => {
    return new Promise(async (resolve, reject) => {
      const viewProduct = await productModel.findById({ _id: view_id }).lean();
      resolve(viewProduct);
      //    console.log(viewProduct);
    });
  },
  getCartDetailes: (userId) => {
    return new Promise(async (resolve, reject) => {
      const cartDetailes = await cartModel
        .findOne({ user_Id: userId })
        .populate("products.productId")
        .lean();
      //  console.log("Cart Details");
      //  console.log(cartDetailes);
      resolve(cartDetailes);
    });
  },
  getHuawei: () => {
    return new Promise(async (resolve, reject) => {
      // let HUAWEI
      let huawei = await productModel
        .find({ brand: 'HUAWEI'})
        .lean();
      console.log(huawei);
      resolve(huawei);
    });
  },
  getHp: () => {
    return new Promise(async (resolve, reject) => {
      // let HUAWEI
      let huawei = await productModel
        .find({ brand: 'HP'})
        .lean();
      console.log(huawei);
      resolve(huawei);
    });
  },
  getApple: () => {
    return new Promise(async (resolve, reject) => {
      // let HUAWEI
      let huawei = await productModel
        .find({ brand: 'APPLE'})
        .lean();
      console.log(huawei);
      resolve(huawei);
    });
  },
};
