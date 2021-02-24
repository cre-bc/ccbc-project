const request = require("superagent");
const express = require("express");
const router = express.Router();
const async = require("async");
var db = require("./common/sequelize_helper.js").sequelize;
var db2 = require("./common/sequelize_helper.js");

/**
 * アクセス情報_DB登録
 */
router.post("/create", (req, res) => {
  console.log("◆create◆");
  if (req.body.db_name != null && req.body.db_name != "") {
    db = db2.sequelize3(req.body.db_name);
  } else {
    db = require("./common/sequelize_helper.js").sequelize;
  }
  db.transaction(async function (tx) {
    console.log(req);
    // アクセスログテーブルinsert
    await tAccessLogInsert(tx, req);
    res.json({ status: true });
  })
    .then((result) => {
      // コミットしたらこっち
      console.log("正常");
    })
    .catch((e) => {
      // ロールバックしたらこっち
      console.log("異常");
      console.log(e);
    });
});
/**
 * t_accessテーブルのinsert用関数
 * @param {*} tx
 * @param {*} req
 */
function tAccessLogInsert(tx, req) {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into t_access (t_shain_pk, screen_no, access_dt, access_tm) " +
      "VALUES (?, ?, current_timestamp, current_timestamp) ";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }

    db.query(sql, {
      transaction: tx,
      replacements: [req.body.loginShainPk, req.body.screenNo],
    }).spread((datas, metadata) => {
      //console.log(datas)
      return resolve(datas);
    });
  });
}
module.exports = router;
