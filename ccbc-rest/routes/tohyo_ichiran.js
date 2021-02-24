const express = require("express");

const router = express.Router();

var db = require("./common/sequelize_helper.js").sequelize;
var db2 = require("./common/sequelize_helper.js");

const query = (sql, params, res, req) => {
  if (req.body.db_name != null && req.body.db_name != "") {
    db = db2.sequelize3(req.body.db_name);
  } else {
    db = require("./common/sequelize_helper.js").sequelize;
  }

  db.query(sql, {
    type: db.QueryTypes.RAW,
  }).spread(async (datas, metadata) => {
    res.json({ status: true, data: datas });
  });
};

router.get("/find", async (req, res) => {
  console.log("OK");
  console.log("req.params:" + req.params);
  console.log("req.body.Target_year:" + req.body.Target_year);
  const params = [];
  const sql =
    "select t_senkyo_pk, senkyo_nm, tohyo_kaishi_dt, tohyo_shuryo_dt, haifu_coin from t_senkyo where delete_flg = '0' order by tohyo_kaishi_dt desc";
  query(sql, params, res, req);
});

router.post("/find2", async (req, res) => {
  console.log("OK");
  console.log("req.params:" + req.params);
  console.log("req.body.Target_year:" + req.body.Target_year);
  const params = [];
  const sql =
    "select t_senkyo_pk, senkyo_nm, tohyo_kaishi_dt, tohyo_shuryo_dt, haifu_coin from t_senkyo where delete_flg = '0' order by tohyo_kaishi_dt desc";
  query(sql, params, res, req);
});

router.post("/find", (req, res) => {
  console.log("---- POST ----");
  console.log("OK");
  console.log("req.body.targetYear:" + req.body.targetYear);
  const params = [];
  const sql =
    "select t_senkyo_pk, senkyo_nm, tohyo_kaishi_dt, tohyo_shuryo_dt, haifu_coin from t_senkyo where delete_flg = '0' and tohyo_kaishi_dt between '" +
    req.body.targetYear +
    "0401' and '" +
    (req.body.targetYear + 1) +
    "0331' order by tohyo_kaishi_dt desc";
  query(sql, params, res, req);
});

module.exports = router;
