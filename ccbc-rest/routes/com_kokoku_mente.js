const express = require("express");
const router = express.Router();
const async = require("async");
var db = require("./common/sequelize_helper.js").sequelize;
var db2 = require("./common/sequelize_helper.js");

var multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // forever起動時にuploadが正常に動作しないため、暫定対応
    cb(null, "/home/BLOCKCHAIN/ccbc-rest/public/uploads/advertise");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
var upload = multer({ storage: storage });

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

/**
 *
 * 検索結果表示
 *
 */
router.post("/find", (req, res) => {
  const params = [];
  const sql =
    "select renban, file_path, comment, delete_flg from t_kokoku" +
    " order by renban asc";
  query(sql, params, res, req);
});

/**
 *
 * 新規登録
 *
 */
router.post("/create", upload.fields([{ name: "image" }]), (req, res) => {
  if (req.body.db_name != null && req.body.db_name != "") {
    db = db2.sequelize3(req.body.db_name);
  } else {
    db = require("./common/sequelize_helper.js").sequelize;
  }

  db.transaction(async function (tx) {
    var resdatas = [];
    if (req.body.renban == "") {
      await tkokokuInsert(tx, resdatas, req);
    } else {
      await tkokokuUpdate(tx, resdatas, req);
    }
    res.json({ status: true, data: resdatas });
  })
    .then((result) => {
    })
    .catch((e) => {
      // ロールバックしたらこっち
      console.log("異常");
      console.log(e);
    });
});

/**
 * tkokokuテーブルのinsert用関数
 * @param {*} tx
 * @param {*} resdatas
 * @param {*} req
 */
function tkokokuInsert(tx, resdatas, req) {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into t_kokoku (file_path, comment, delete_flg, insert_user_id, insert_tm, update_user_id, update_tm) " +
      "VALUES (?, ?, ?, ?, current_timestamp, ?, ?) ";

    db.query(sql, {
      transaction: tx,
      replacements: [
        req.body.file_path,
        req.body.comment,
        req.body.delete_flg,
        req.body.userid,
        null,
        null,
      ],
    }).spread((datas, metadata) => {
      resdatas.push(datas);
      return resolve(datas);
    });
  });
}

/**
 * tkokokuテーブルのupdate用関数
 * @param {*} tx
 * @param {*} resdatas
 * @param {*} req
 */
function tkokokuUpdate(tx, resdatas, req) {
  return new Promise((resolve, reject) => {
    var sql =
      "update t_kokoku set file_path = ?, comment = ?, delete_flg = ?, " +
      "update_user_id = ?, update_tm = current_timestamp WHERE renban = ?";

    db.query(sql, {
      transaction: tx,
      replacements: [
        req.body.file_path,
        req.body.comment,
        req.body.delete_flg,
        req.body.userid,
        req.body.renban,
      ],
    }).spread((datas, metadata) => {
      resdatas.push(datas);
      return resolve(datas);
    });
  });
}

module.exports = router;
