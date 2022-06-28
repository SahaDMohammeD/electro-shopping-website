var express = require("express");
var router = express.Router();
const userHelpers = require("../helpers/user-helpers");
const productHelpers = require("../helpers/product-helpers");
var userModel = require("../model/user-schema");
var flash = require("connect-flash");
const { response } = require("express");
const razorpay = require("razorpay");

/* GET home page. */
router.get("/", async (req, res) => {
  let user = req.session.user;
  let product = await productHelpers.getProduct();
  let huawei = await productHelpers.getHuawei();
  let hp = await productHelpers.getHp();
  let apple = await productHelpers.getApple();
  console.log(product);
  let wishListCount = null;
  let cartCount = null;
  let cartProduct = null;
  if (req.session.user) {
    wishListCount = await userHelpers.getWishProductCount(req.session.user._id);
    cartCount = await userHelpers.getCartProductCount(req.session.user._id);
    cartProduct = await userHelpers.getCartItems(req.session.user._id);
    res.render("user/home", {
      user,
      product,
      huawei,
      hp,
      apple,
      wishListCount,
      cartCount,
      cartProduct,
    });
  }
  res.render("user/home", {
    user,
    product,
    huawei,
    hp,
    apple,
    wishListCount,
    cartCount,
    cartProduct,
  });
});

router.get("/login", function (req, res, next) {
  let err = req.flash("msg");
  res.render("user/login", { err });
});
router.post("/login", (req, res) => {
  // console.log(req.body);
  userHelpers
    .doLogin(req.body)
    .then((response) => {
      if (response.status) {
        if (!response.userBlock) {
          req.session.loggedIn = true;
          req.session.user = response.user;
          res.redirect("/");
        } else {
          req.flash("msg", "Admin Blocked");

          res.redirect("/login");
        }
      } else {
        res.redirect("/login");
      }
    })
    .catch(() => {
      res.redirect("/login");
    });
});

router.get("/signup", function (req, res, next) {
  res.render("user/signup");
});

router.post("/signup", function (req, res) {
  userHelpers
    .dosignup(req.body)
    .then((response) => {
      req.session.user = req.body;
      req.session.otp = response.otpCode;
      // console.log(req.session.otp);
      res.redirect("/verification");
    })
    .catch((error) => {
      res.redirect("/signup");
    });
});

router.get("/verification", (req, res) => {
  res.render("user/verification");
});
router.post("/verification", async (req, res) => {
  await userHelpers
    .otpverify(req.body, req.session.otp, req.session.user)
    .then((response) => {
      // console.log(response);
      res.redirect("/");
    })
    .catch((error) => {
      // console.log(error.msg);
      res.redirect("/verification");
    });
});

router.get("/forgotpassword", function (req, res, next) {
  res.render("user/forgotpassmail");
});
router.post("/verifyforgotmail", function (req, res) {
  userHelpers
    .forgotpassword(req.body)
    .then((response) => {
      req.session.forgotuser = req.body;
      req.session.forgototp = response.forgotCode;
      // console.log(req.session.forgototp);
      // console.log(req.session.forgotuser);
      res.redirect("/forgotmailverify");
    })
    .catch((error) => {
      // console.log(error.msg +'Hai');
      res.redirect("/forgotpassword");
    });
});

router.get("/forgotmailverify", (req, res) => {
  res.render("user/forgotmailverify");
});
router.post("/resetpassword", (req, res) => {
  userHelpers
    .forgetOtpVerify(req.body, req.session.forgototp, req.session.forgotuser)
    .then((response) => {
      // console.log(response);
      res.redirect("/resetforgotpass");
    })
    .catch((error) => {
      // console.log(error.msg);
      res.redirect("/forgotmailverify");
    });
});
router.get("/resetforgotpass", (req, res) => {
  const mail = req.session.forgotuser.Email;
  res.render("user/resetforgotpass", { Email: mail });
});
router.post("/update-password/:id", (req, res) => {
  // console.log("Halo this one");
  // let id = req.params.id
  let Email = req.params.id;
  // console.log(Email);
  userHelpers
    .SetnewPassword(req.body, Email)
    .then((data) => {
      req.session.loggedIn = true;
      req.session.forgotuser = data;
      // console.log(req.session.forgotuser);
      res.redirect("/login");
    })
    .catch((err) => {
      req.session.passErr = err.msg;
      // console.log(req.session.passErr);
      res.redirect("/resetforgotpass");
    });
});
router.get("/profile", async (req, res) => {
  let user = req.session.user;
  // console.log(req.session.user);
  let getUserDetails = await userHelpers.getUserDetails(user);
  // console.log(getUserDetails);
  res.render("user/profile", { user, getUserDetails });
});
router.get("/address", async (req, res) => {
  let user = req.session.user;
  // console.log(req.session.user);
  let getUserDetails = await userHelpers.getUserDetails(user);
  // console.log(getUserDetails);
  res.render("user/address-form", { user, getUserDetails });
});
router.post("/save-adress", (req, res) => {
  userHelpers.addAddress(req.body);
  res.redirect("/user/profile");
});
// router.post('/update-password', (req, res) => {
//   userHelpers.SetnewPassword
//     res.redirect('/login')
//   })

router.get("/view-cart", async (req, res) => {
  // console.log('Cart');
  if (req.session.user) {
    let user = req.session.user;
    let userId = req.session.user._id;
    let subTotal = await userHelpers.getSubTotalAmount(req.session.user._id);
    let grandTotal = await userHelpers.getGrandTotal(req.session.user._id);
    let cartProducts = await userHelpers.getCartItems(userId);
    console.log(cartProducts);
    if (cartProducts) {
      let notEmpty = cartProducts.products.length != 0;
      res.render("user/cart-view", {
        cartProducts,
        notEmpty,
        user,
        subTotal,
        grandTotal,
      });
    }
  } else {
    res.redirect("/login");
  }
});
router.get("/add-to-cart/:id", (req, res) => {
  let product = req.params.id;
  let user = req.session.user._id;
  userHelpers
    .addToCart(product, user)
    .then((response) => {
      res.json(response);
    })
    .catch((error) => {
      // console.log(error.msg);
      res.redirect("/login");
    });
});
router.get("/wish-to-cart/:id", (req, res) => {
  let product = req.params.id;
  let user = req.session.user._id;
  userHelpers
    .addToCart(product, user)
    .then((response) => {
      res.json(response);
    })
    .catch((error) => {
      // console.log(error.msg);
      res.redirect("/login");
    });
});
router.post("/change-Product-Quantity", (req, res) => {
  // console.log("Change");
  const user = req.session.user;
  userHelpers.changeProductQuantity(req.body, user).then((response) => {
    res.json(response);
  });
});
router.get("/delete-cart-product/:id", (req, res) => {
  let productId = req.params.id;
  let user = req.session.user;
  userHelpers.deleteCartProduct(productId, user).then((response) => {
    res.redirect("/view-cart");
  });
});
router.get("/delete-cart/:id", (req, res) => {
  let productId = req.params.id;
  let user = req.session.user;
  userHelpers.deleteCartProduct(productId, user).then((response) => {
    res.redirect("/view-cart");
  });
});

router.get("/view-product/:id", async (req, res) => {
  let wishListCount = 0;
  let cartCount = 0;
  if (req.session.user) {
    let user = req.session.user;
    wishListCount = await userHelpers.getWishProductCount(req.session.user._id);
    cartCount = await userHelpers.getCartProductCount(req.session.user._id);
    let view = req.params.id;
    // console.log(view +'View');
    let viewProduct = await productHelpers.getViewProduct(view);
    res.render("user/product-view", {
      viewProduct,
      user,
      wishListCount,
      cartCount,
    });
  } else {
    let view = req.params.id;
    let viewProduct = await productHelpers.getViewProduct(view);
    res.render("user/product-view", { viewProduct });
  }
});
// router.get("/view-to-cart/:id", (req, res) => {
//   let product = req.params.id;
//   let user = req.session.user._id;
//   userHelpers
//     .addToCart(product, user)
//     .then((response) => {
//       res.json(response);
//     })
//     .catch((error) => {
//       // console.log(error.msg);
//       res.redirect("/login");
//     });
// });
router.get("/view-wish-list", async (req, res) => {
  if (req.session.user) {
    let userId = req.session.user._id;
    let wishList = await userHelpers.getWishList(userId);
    res.render("user/wish-List", { wishList });
  } else {
    res.redirect("/login");
  }
});
router.get("/add-wish-list/:id", async (req, res) => {
  let product = req.params.id;
  let user = req.session.user._id;
  userHelpers.changeWishlistButton(product).then();
  userHelpers.addToWishlist(product, user).then((response) => {
    res.json(response);
  });
});
router.get("/delete-wislist-product/:id", (req, res) => {
  let productId = req.params.id;
  let user = req.session.user;
  userHelpers.changeWishlistAddButton(productId).then();
  userHelpers.deleteWishProduct(productId, user).then((response) => {
    res.redirect("/view-wish-list");
  });
});

router.get("/home", (req, res) => {
  res.render("/user/home");
});

router.get("/check-out", async (req, res) => {
  if (req.session.user) {
    let user = req.session.user;
    // console.log(user);
    let getUserAddress = await userHelpers.getUserAddress(user);
    let newAddress = await userHelpers.getNewAddress(user);
    res.render("user/checkout", { getUserAddress, newAddress, user });
  } else {
    res.redirect("/");
  }
});
router.post("/save-new-address", (req, res) => {
  let userId = req.session.user._id;
  userHelpers.addShippindAddress(req.body, userId).then((response) => {
    res.redirect("/check-out");
  });
});
router.get("/deliver-here/:id", async (req, res) => {
  if (req.session.user) {
    req.session.selectedAddress = req.params.id;
    let user = req.session.user;
    let checkOutAddress = await userHelpers.getCheckoutAddress(req.params.id);
    let cartDetailes = await productHelpers.getCartDetailes(user);
    // let notEmpty = cartDetailes.products.length != 0;
    // console.log(cartDetailes);
    res.render("user/payment-details", { checkOutAddress, cartDetailes, user });
  } else {
    res.redirect("/");
  }
});
router.post("/place-order", async (req, res) => {
  if (req.session.user) {
    let addressId = req.session.selectedAddress;
    const selectedAddress = await userHelpers.getCheckoutAddress(addressId);
    let cartDetailes = await productHelpers.getCartDetailes(
      req.session.user._id
    );
    // console.log(cartDetailes,'CartDetails');
    const grandTotal = await userHelpers.getGrandTotal(req.session.user._id);
    userHelpers
      .placeOrder(
        req.session.user._id,
        req.body,
        cartDetailes,
        grandTotal,
        selectedAddress
      )
      .then((response) => {
        if (req.body["payment"] === "COD") {
          res.json({ codSuccess: true });
        } else {
          userHelpers
            .generateRazorpay(response.orderId, grandTotal.total)
            .then((response) => {
              // console.log("online");
              res.json(response);
            });
        }
      });
  } else {
    res.redirect("/");
  }
});
router.post("/verify-payment", (req, res) => {
  // console.log(req.body);
  userHelpers
    .verifyPayment(req.body)
    .then(() => {
      userHelpers.changePaymentStatus(req.body["order[receipt]"]).then(() => {
        // console.log("payment successful");
        res.json({ status: true });
      });
    })
    .catch((err) => {
      res.json({ status: false });
    });
});
router.get("/confirmation", (req, res) => {
  res.render("user/confirmation");
});

router.get("/orders", async (req, res) => {
  let wishListCount = null;
  let cartCount = null;
  let cartProduct = null;
  if (req.session.user) {
    let user = req.session.user;
    const orders = await userHelpers.getOrders(req.session.user._id);
    wishListCount = await userHelpers.getWishProductCount(req.session.user._id);
    cartCount = await userHelpers.getCartProductCount(req.session.user._id);
    cartProduct = await userHelpers.getCartItems(req.session.user._id);
    // console.log(orders);
    res.render("user/orders", {
      orders,
      user,
      wishListCount,
      cartCount,
      cartProduct,
    });
  } else {
    res.redirect("/");
  }
});
router.get("/order-detail/:id", async (req, res) => {
  let wishListCount = null;
  let cartCount = null;
  let cartProduct = null;
  let user = req.session.user;
  req.session.cancelledId = req.params.id;
  if (req.session.user) {
    const orderSummary = await userHelpers.getOrderSummary(req.params.id);
    const productDetail = await userHelpers.getOrderedProducts(req.params.id);
    wishListCount = await userHelpers.getWishProductCount(req.session.user._id);
    cartCount = await userHelpers.getCartProductCount(req.session.user._id);
    cartProduct = await userHelpers.getCartItems(req.session.user._id);

    // console.log(productDetail);
    res.render("user/order-detail", {
      orderSummary,
      productDetail,
      user,
      wishListCount,
      cartCount,
      cartProduct,
    });
  }
});
router.get("/orderCancelled", (req, res) => {
  console.log("Cancel Router");
  let order = req.session.cancelledId;
  userHelpers.orderCancelled(order).then();
  res.redirect("/order-detail/" + order);
});
//search product//
router.post("/search-product", async (req, res) => {
  let searchText = req.body["search_name"];
  console.log(searchText + "Search Product Name");
  try {
    let products = await userHelpers.getallProucts();
    console.log(products, "product");
    if (searchText) {
      let searchProduct = products.filter((u) => u.name.includes(searchText));
      console.log("Search Product");
      console.log(searchProduct);
      res.render("user/search", { searchProduct });
    }
  } catch (err) {
    console.log(err);
  }
});

router.get("/categoryOne/:key", async (req, res) => {
  let category = req.params.key;
  console.log(category);
  let categoryProduct = await userHelpers.getCategoryItems(category);
  res.render("user/categoryOne", { categoryProduct });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});
module.exports = router;
