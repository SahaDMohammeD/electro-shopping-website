const Mongoose = require("mongoose");
const addressModel = require("./address-schema");
const orderSchema = new Mongoose.Schema({
  user_Id: { type: Mongoose.Schema.Types.ObjectId, ref: "users" },
  payment_Method: { type: String },
  products: [
    {
      productId: { type: Mongoose.Schema.Types.ObjectId, ref: "product" },
      price: { type: Number },
      quantity: { type: Number, default: 1 },
      subtotal: { type: Number },
    },
  ],
  grandTotal: { type: Number },
  ordered_on: { type: String },
  shippingAddress: {
    Name: { type: String },
    Number: { type: Number },
    Address: { type: String },
    Pincode: { type: Number },
    City: { type: String },
    State: { type: String },
    Country: { type: String },
  },
  cancel: {
    type: Boolean,
    default: false,
  },
  status: { type: String },
});
const orderModel = Mongoose.model("order", orderSchema);
module.exports = orderModel;
