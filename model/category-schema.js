const mongoose = require("mongoose");
const categorySchema = mongoose.Schema({
  Name: {
    type: String,
    require: true,
  },
});

const category = mongoose.model("category", categorySchema);
module.exports = category;
