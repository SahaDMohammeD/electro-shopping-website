const userModel = require("../model/user-schema");
const productModel = require("../model/product-schema");
const categoryModel = require("../model/category-schema");
const subCategoryModel = require("../model/subCategory-schema");
const orderModel = require("../model/order-schema");
const cartModel = require("../model/cart-schema");
const wishlistModel = require("../model/wishlist-schema");
const { response } = require("../app");
// const bcrypt = require("bcrypt");
// const nodemailer = require("nodemailer");

module.exports = {
  addProduct: (productDetails, image1, image2, image3, image4) => {
    return new Promise(async (resolve, reject) => {
      if (!image2) {
        reject({ msg: "upload image" });
      } else {
        const newproduct = new productModel({
          name: productDetails.name,
          mrpprice: productDetails.mrpPrice,
          price: productDetails.price,
          description: productDetails.description,
          stock: productDetails.stock,
          discount: productDetails.discount,
          category: productDetails.category,
          brand: productDetails.brand,
          images: { image1, image2, image3, image4 },
        });

        await newproduct.save(async (err, res) => {
          if (err) {
          }
          resolve({ data: res, msg: "success" });
        });
      }
    });
  },
  sellingPrice: (productId, price, discount) => {
    return new Promise(async (resolve, reject) => {
      let oldprice = price;
      let discountNo = discount;
      let discount_price = (oldprice * discountNo) / 100;
      let newPrice = oldprice - discount_price;
      await productModel.findByIdAndUpdate(
        { _id: productId },
        { $set: { price: newPrice } }
      );
      resolve();
    });
  },
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      const product = await productModel.find({}).lean();
      //  console.log(product);
      resolve({ product });
    });
  },
  productDetail: (prodectid) => {
    return new Promise((resolve, reject) => {
      productModel
        .findOne({ _id: prodectid })
        .lean()
        .then((product) => {
          resolve(product);
        });
    });
  },
  editProduct: (productDetailes, productId, image1, image2, image3, image4) => {
    return new Promise(async (resolve, reject) => {
      productModel
        .findByIdAndUpdate(
          { _id: productId },
          {
            $set: {
              name: productDetailes.name,
              price: productDetailes.mrpprice,
              description: productDetailes.description,
              stock: productDetailes.stock,
              discount: productDetailes.discount,
              category: productDetailes.category,
              brand: productDetailes.brand,
              images: { image1, image2, image3, image4 },
            },
          }
        )
        .then((response) => {
          resolve(response);
          // console.log(response);
          // console.log("Edit Response");
        });
    });
  },
  deleteProduct: (productId) => {
    return new Promise((resolve, reject) => {
      productModel.remove({ _id: productId }).then((response) => {
        resolve(response);
      });
    });
  },
  checkCart: (productId) => {
    return new Promise((resolve, reject) => {
      cartModel
        .remove({
          productId: productId,
        })
        .then((response) => {
          resolve(response);
        });
    });
  },
  checkWishList: (productId) => {
    return new Promise((resolve, reject) => {
      wishlistModel
        .remove({
          productId: productId,
        })
        .then((response) => {
          resolve(response);
        });
    });
  },
  addCategory: (categoryName) => {
    console.log(categoryName);
    return new Promise(async (resolve, reject) => {
      const category = await categoryModel.findOne({
        Name: categoryName.category_Name,
      });
      console.log(category);
      if (category) {
        reject({ msg: "Category Already Exists" });
      } else {
        const newCategory = new categoryModel({
          Name: categoryName.category_Name,
        });
        await newCategory.save(async (err, result) => {
          if (err) {
            reject({ err, msg: "Category Not Added" });
          }
          console.log(result);
          resolve({ result, msg: "Category Add" });
        });
      }
    });
  },

  getCategory: () => {
    return new Promise(async (resolve, reject) => {
      const category = await categoryModel.find({}).lean();
      console.log(category);
      resolve(category);
    });
  },

  // addSubCategory: (subcategory_Name) => {
  //   return new Promise(async (resolve, reject) => {
  //     const category = await categoryModel.findOne({
  //       Name: subcategory_Name.category,
  //     });
  //     console.log(subcategory_Name.sub_category_name);
  //     console.log(category._id);
  //     if (category) {
  //       // reject({msg:"subcategory already exists"})
  //       // }
  //       // else{
  //       const newsubcategory = new subCategoryModel({
  //         subName: subcategory_Name.sub_category_name,
  //         category: category._id,
  //       });
  //       await newsubcategory.save(async (err, result) => {
  //         if (err) {
  //           reject({ msg: "subcategory not added" });
  //         } else {
  //           resolve({ result, msg: "subcategory added" });
  //         }
  //       });
  //     }
  //   });
  // },
  // getsubCategory: () => {
  //   return new Promise(async (resolve, reject) => {
  //     const subCategory = await subCategoryModel.find({}).lean();
  //     console.log(subCategory);
  //     resolve(subCategory);
  //   });
  // },

  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      const user = await userModel.find({}).lean();
      // console.log(product);
      resolve(user);
    });
  },
  blockUser: (userId) => {
    console.log("block");
    console.log(userId);
    return new Promise(async (resolve, reject) => {
      await userModel.findByIdAndUpdate(
        { _id: userId },
        { $set: { block: true } }
      );
      resolve();
    });
  },
  unBlockUser: (userId) => {
    console.log("unblock");
    console.log(userId);
    return new Promise(async (resolve, reject) => {
      await userModel.findByIdAndUpdate(
        { _id: userId },
        { $set: { block: false } }
      );
      resolve();
    });
  },
  deleteUser: (userId) => {
    return new Promise((resolve, reject) => {
      userModel.remove({ _id: userId }).then((response) => {
        resolve(response);
      });
    });
  },
  getAllOrders: () => {
    return new Promise(async (resolve, reject) => {
      const orders = await orderModel.find({}).lean();
      resolve(orders);
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
  getTotalIncome: () => {
    return new Promise(async (resolve, reject) => {
      let totalIncome = await orderModel.aggregate([
        {
          $group: {
            _id: null,
            grandTotal: {
              $sum: "$grandTotal",
            },
          },
        },
      ]);
      let sum = totalIncome[0].grandTotal;
      resolve(sum);
    });
  },
  getTotalOrders: () => {
    return new Promise(async (resolve, reject) => {
      let totalOrders = await orderModel.count();
      console.log(totalOrders);
      resolve(totalOrders);
    });
  },
  getTotalCustomers: () => {
    return new Promise(async (resolve, reject) => {
      let totalCustomers = await userModel.count();
      console.log(totalCustomers);
      resolve(totalCustomers);
    });
  },
  getTotalProducts: () => {
    return new Promise(async (resolve, reject) => {
      let totalProducts = await productModel.count();
      console.log(totalProducts);
      resolve(totalProducts);
    });
  },
  statusController: (orderId, status) => {
    console.log(orderId);
    console.log(status);
    return new Promise(async (resolve, reject) => {
      await orderModel.findByIdAndUpdate(
        { _id: orderId },
        { $set: { status: status } }
      );
      resolve();
    });
  },
};
