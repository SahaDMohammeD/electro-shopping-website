const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
  //brand:{type:String},
  name: { type: String },
  mrpprice: { type: Number },
  price: { type: Number, default: 0 },
  description: { type: String },
  stock: { type: Number },
  discount: { type: Number },
  wishlist: {
    type: Boolean,
    default: false,
  },
  category: {
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:'subCategory'},
    //  brand:{trpe:String,
    type: String,
  },
  images: {
    type: Array,
  },
});
module.exports = mongoose.model("product", productSchema);
