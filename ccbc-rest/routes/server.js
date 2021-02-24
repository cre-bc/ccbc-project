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

router.get("/find", (req, res) => {
  console.log("OK");
  console.log(req.params);
  const params = [];
  const sql = "select * from test";
  query(sql, params, res);
});

router.post("/check", (req, res) => {
  console.log("check!");
  var input = req.body.inputtext;
  var result = false;
  if (input === "test") {
    result = true;
  }
  res.json({ status: result });
});

module.exports = router;
