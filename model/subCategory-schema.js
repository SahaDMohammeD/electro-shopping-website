const mongoose = require("mongoose");
const subCategorySchema = mongoose.Schema({
  subName: {
    type: String,
    require: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
  },
});

const subCategory = mongoose.model("subCategory", subCategorySchema);
module.exports = subCategory;
