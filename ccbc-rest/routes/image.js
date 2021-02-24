const express = require("express");

const router = express.Router();

const db = require("./common/pg_helper.js");

const query = (sql, params, res) => {
  db.query(sql, params, (err, datas) => {
    if (err) {
      console.log(`failed...${err}`);
      res.status(400).send(`エラーが発生しました<br />${err}`);
      return;
    }
    console.log("success!!");
    console.log(datas);
    res.json({ status: true, data: datas });
  });
};

var path = require("path");
var multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
var upload = multer({ storage: storage });

router.post("/update", upload.single("image"), function (req, res) {
  var sql = "update test set" + " image = $2" + " where id = $1";
  query(sql, [1, req.file.filename], res);
});

router.get("/find", (req, res) => {
  console.log("OK");
  console.log(req.body);
  const params = [];
  const sql = "select image from test where id = 1";
  query(sql, params, res);
});

module.exports = router;
