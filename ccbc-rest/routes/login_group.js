const request = require("superagent");
const express = require("express");
const router = express.Router();
const async = require("async");
const db = require("./common/sequelize_helper.js").sequelize2;

router.post("/find", (req, res) => {
  console.log("----------");
  console.log("id:" + req.body.id);
  console.log("----------");

  var sql =
    "select t_group_pk, group_id, db_name, bc_addr from t_group where delete_flg = '0' and group_id = :myid";

  db.query(sql, {
    replacements: { myid: req.body.id },
    type: db.QueryTypes.RAW,
  }).spread(async (datas, metadata) => {
    console.log("----------");
    console.log(datas);
    console.log("----------");

    // ユーザ情報が取得できない場合は終了
    if (datas == "") {
      res.json({ status: false });
      return;
    }

    console.log("----------");
    console.log(datas[0].t_group_pk);
    console.log(datas[0].group_id);
    console.log(datas[0].db_name);
    console.log(datas[0].bc_addr);
    console.log("----------");

    res.json({ status: true, data: datas });
  });
});

module.exports = router;
