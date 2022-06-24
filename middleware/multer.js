var multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = file.originalname.substring(
      file.originalname.lastIndexOf(".")
    );
    cb(null, Date.now() + "-" + file.filename);
  },
});

module.exports = store = multer({ storage: storage });
