const mongoose = require('mongoose');

require('dotenv').config()

console.log(process.env.MONGODB_URL);

mongoose.connect(process.env.MONGODB_URL,{ useNewUrlParser: true, useUnifiedTopology: true })
  .then((_) => {
   console.log("mongoose is connected");
  })
  .catch((error) => {
    console.log(error);
  });