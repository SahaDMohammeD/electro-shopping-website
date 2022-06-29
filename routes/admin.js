var express = require("express");
const multer = require("multer");
var router = express.Router();
var multur = require("../middleware/multer");
const orderModel = require("../model/order-schema");
const adminHelpers = require("../helpers/admin-helpers");
const { response } = require("../app");

router.get("/", (req, res) => {
  res.header(
    "Cache-control",
    "no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  if (req.session.loggedIn) {
    // console.log('Home');
    res.redirect("/admin/home");
  } else {
    req.session.logginError = false;
    res.render("admin/login");
  }
});

router.post("/submit", (req, res) => {
  console.log("Log");
  let adminEmail = "admin@gmail.com";
  let passWord = "1234";
  if (req.body.Email == adminEmail && req.body.Password == passWord) {
    req.session.loggedIn = true;
    req.session.admin = req.body;
    res.render("admin/home");
  } else {
    res.redirect("/admin");
  }
});

router.get("/home", async (req, res) => {
  let totalOrders = await adminHelpers.getTotalOrders();
  let totalCustomers = await adminHelpers.getAllUsers();
  let totalProducts = await adminHelpers.getAllProducts();
  let totalIncome = await adminHelpers.getTotalIncome();
  res.render("admin/home", {
    totalOrders,
    totalCustomers,
    totalProducts,
    totalIncome,
  });
});

router.get("/products", (req, res) => {
  // console.log('Products');
  adminHelpers.getAllProducts().then((response) => {
    const product = response.product;
    // console.log(product);
    res.render("admin/products", { product });
  });
});

router.get("/add-category", async (req, res) => {
  const category = await adminHelpers.getCategory();
  console.log(category);
  res.render("admin/add-category", { category });
});
router.post("/add-category", (req, res) => {
  // console.log(req.body);
  adminHelpers
    .addCategory(req.body)
    .then((response) => {
      console.log(response.msg);
      res.redirect("/admin/add-category");
    })
    .catch((error) => {
      console.log(error.msg);
      res.redirect("/admin/add-category");
    });
});

// router.post("/add-subcategory", (req, res) => {
//   adminHelpers
//     .addSubCategory(req.body)
//     .then((response) => {
//       console.log(response);
//       res.redirect("/admin/products");
//     })
//     .catch((error) => {
//       console.log(error.msg);
//       res.redirect("/admin/add-category");
//     });
// });

router.get("/add-products", async (req, res) => {
  const category = await adminHelpers.getCategory();
  // console.log(subCategory);
  res.render("admin/add-products", { category });
});

router.post(
  "/addproduct",
  multur.fields([
    { name: "img_1", maxCount: 1 },
    { name: "img_2", maxCount: 1 },
    { name: "img_3", maxCount: 1 },
    { name: "img_4", maxCount: 1 },
  ]),
  (req, res) => {
    console.log(req.files);
    let image1 = req.files.img_1[0].filename;
    let image2 = req.files.img_2[0].filename;
    let image3 = req.files.img_3[0].filename;
    let image4 = req.files.img_4[0].filename;
    const files = req.files.filename;
    adminHelpers
      .addProduct(req.body, image1, image2, image3, image4)
      .then((response) => {
        let productId = response.data._id;
        let price = response.data.mrpprice;
        let discount = response.data.discount;
        console.log(req.body);
        adminHelpers.sellingPrice(productId, price, discount);
        res.redirect("/admin/products");
      });
  }
);
router.get("/edit-Product/:id", async (req, res) => {
  const productData = await adminHelpers.productDetail(req.params.id);
  const category = await adminHelpers.getCategory();
  // const subCategory = await adminHelpers.getsubCategory();
  // console.log(productData);
  res.render("admin/edit-Product", { productData, category });
});
router.post(
  "/edit-Product/:id",
  multur.fields([
    { name: "image_1", maxCount: 1 },
    { name: "image_2", maxCount: 1 },
    { name: "image_3", maxCount: 1 },
    { name: "image_4", maxCount: 1 },
  ]),
  function (req, res) {
    let image1 = req.files.image_1
      ? req.files.image_1[0].filename
      : req.body.image1;
    let image2 = req.files.image_2
      ? req.files.image_2[0].filename
      : req.body.image2;
    let image3 = req.files.image_3
      ? req.files.image_3[0].filename
      : req.body.image3;
    let image4 = req.files.image_4
      ? req.files.image_4[0].filename
      : req.body.image4;
    adminHelpers
      .editProduct(req.body, req.params.id, image1, image2, image3, image4)
      .then((prodId) => {
        res.redirect("/admin/products");
      });
  }
);
router.get("/delete-product/:id", (req, res) => {
  let productId = req.params.id;
  adminHelpers.checkCart(productId);
  adminHelpers.checkWishList(productId);
  adminHelpers.deleteProduct(productId).then((response) => {
    res.redirect("/admin/products");
  });
});

router.get("/users-info", (req, res) => {
  adminHelpers.getAllUsers().then((response) => {
    const users = response;
    res.render("admin/user-info", { users });
  });
});
router.get("/block-user/:id", (req, res) => {
  let userId = req.params.id;
  adminHelpers.blockUser(userId).then((response) => {
    req.session.loggedIn = false;
    // req.flash('msg','You Blocked '+response)
    res.redirect("/admin/users-info");
  });
});
router.get("/unblock-user/:id", (req, res) => {
  let userId = req.params.id;
  adminHelpers.unBlockUser(userId).then((response) => {
    req.session.loggedIn = true;
    // req.flash('msg','You UnBlocked '+response)
    res.redirect("/admin/users-info");
  });
});
router.get("/delete-user/:id", (req, res) => {
  let userId = req.params.id;
  adminHelpers.deleteUser(userId).then((response) => {
    req.session.loggedIn = false;
    // req.flash('msg','You Blocked '+response)
    res.redirect("/admin/users-info");
  });
});

router.get("/order-info", async (req, res) => {
  let orders = await adminHelpers.getAllOrders();
  res.render("admin/order-managment", { orders });
});

router.get("/order-detail/:id", async (req, res) => {
  let id = req.params.id;
  const orderSummary = await adminHelpers.getOrderSummary(id);
  const productDetail = await adminHelpers.getOrderedProducts(id);
  res.render("admin/order-details", {
    orderSummary,
    productDetail,
  });
});
router.post("/getData", async (req, res) => {
  let salesReport = await orderModel.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: "$grandTotal" },
      },
    },
  ]);

  res.json({ sum: salesReport[0].total });
});

router.post("/status-controller/:id", (req, res) => {
  let orderId = req.params.id;
  let status = req.body.status;
  console.log(orderId);
  console.log(status);
  adminHelpers.statusController(orderId, status);
  res.redirect("/admin/order-info");
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("admin/login");
});
module.exports = router;
