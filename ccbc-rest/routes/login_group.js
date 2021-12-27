const request = require("superagent");
const express = require("express");
const router = express.Router();
const async = require("async");
const db = require("./common/sequelize_helper.js").sequelize2;

router.post("/find", async (req, res) => {
  var sql =
    "select t_group_pk, group_id, db_name, bc_addr from t_group where delete_flg = '0' and group_id = :myid";

  db.query(sql, {
    replacements: { myid: req.body.id },
    type: db.QueryTypes.RAW,
  }).spread(async (datas, metadata) => {
    // ユーザ情報が取得できない場合は終了
    if (datas == "") {
      res.json({ status: false });
      return;
    }
    res.json({ status: true, data: datas });
  });
});

module.exports = router;
