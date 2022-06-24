const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Number: {
    type: Number,
    required: true,
  },
  Email: {
    type: String,
    required: true,
  },
  Address: {
    type: String,
    default: null,
  },
  City: {
    type: String,
    default: null,
  },
  Zip: {
    type: Number,
    default: null,
  },
  State: {
    type: String,
    default: null,
  },
  Country: {
    type: String,
    default: null,
  },
  block: {
    type: Boolean,
    default: false,
  },
  Password: {
    type: String,
    required: true,
  },
  Repete: {
    type: String,
  },
});

const user = mongoose.model("user", UserSchema);
module.exports = user;
