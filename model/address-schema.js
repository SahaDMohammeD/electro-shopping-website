const mongoose = require("mongoose");
const addressSchema = new mongoose.Schema({
  user_Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  Name: { type: String },
  Email: { type: String },
  Number: { type: Number },
  Address: { type: String },
  Pincode: { type: Number },
  City: { type: String },
  State: { type: String },
  Country: { type: String },
});
const addressModel = mongoose.model("address", addressSchema);
module.exports = addressModel;
