const express = require("express");
const router = express.Router();
const async = require("async");
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

/**
 *
 * 検索結果表示
 *
 */
router.post("/find", (req, res) => {
  console.log("OK!!");
  console.log("req.params:" + req.params);
  console.log("req.body.targetCode:" + req.body.targetCode);
  const params = [];
  const sql =
    "select renban, file_path, comment from t_kokoku where delete_flg = '0'" +
    " order by renban asc";
  query(sql, params, res, req);
});

/**
 *
 * 新規登録
 *
 */
router.post("/create", (req, res) => {
  console.log("◆create◆");
  if (req.body.db_name != null && req.body.db_name != "") {
    db = db2.sequelize3(req.body.db_name);
  } else {
    db = require("./common/sequelize_helper.js").sequelize;
  }

  db.transaction(async function (tx) {
    var resdatas = [];
    console.log(req);
    await tkokokuInsert(tx, resdatas, req);
    res.json({ status: true, data: resdatas });
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
 *
 * 更新登録
 *
 */
router.post("/edit", (req, res) => {
  console.log("◆edit◆");
  if (req.body.db_name != null && req.body.db_name != "") {
    db = db2.sequelize3(req.body.db_name);
  } else {
    db = require("./common/sequelize_helper.js").sequelize;
  }
  db.transaction(async function (tx) {
    var resdatas = [];
    console.log(req);
    await tkokokuUpdate(tx, resdatas, req);
    res.json({ status: true, data: resdatas });
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
 *
 * 更新登録（削除フラグ = 1）
 *
 */
router.post("/delete", (req, res) => {
  console.log("◆delete◆");
  if (req.body.db_name != null && req.body.db_name != "") {
    db = db2.sequelize3(req.body.db_name);
  } else {
    db = require("./common/sequelize_helper.js").sequelize;
  }
  db.transaction(async function (tx) {
    var resdatas = [];
    console.log(req);
    await tkokokuDelete(tx, resdatas, req);
    res.json({ status: true, data: resdatas });
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
 * tkokokuテーブルのinsert用関数
 * @param {*} tx
 * @param {*} resdatas
 * @param {*} req
 */
function tkokokuInsert(tx, resdatas, req) {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into t_kokoku (file_path, comment, delete_flg, insert_user_id, insert_tm, update_user_id, update_tm) " +
      "VALUES (?, ?, ?, ?, ?, ?, current_timestamp) ";

    db.query(sql, {
      transaction: tx,
      replacements: [
        req.body.title,
        req.body.comment,
        req.body.notice_dt,
        "0",
        req.body.userid,
        null,
        null,
      ],
    }).spread((datas, metadata) => {
      console.log("◆◆◆");
      console.log(datas);
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
      "update t_kokoku set file_path = ?, comment = ?" +
      "update_user_id = ?, update_tm = current_timestamp WHERE renban = ?";

    db.query(sql, {
      transaction: tx,
      replacements: [
        req.body.title,
        req.body.comment,
        req.body.notice_dt,
        req.body.userid,
        req.body.renban,
      ],
    }).spread((datas, metadata) => {
      console.log("◆◆◆◆");
      console.log(datas);
      resdatas.push(datas);
      return resolve(datas);
    });
  });
}

/**
 * tkokokuテーブルのdelete用関数
 * @param {*} tx
 * @param {*} resdatas
 * @param {*} req
 */
function tkokokuDelete(tx, resdatas, req) {
  return new Promise((resolve, reject) => {
    var sql = "update t_kokoku set delete_flg = '1' WHERE renban = ?";

    db.query(sql, {
      transaction: tx,
      replacements: [req.body.renban],
    }).spread((datas, metadata) => {
      console.log("◆◆◆◆◆");
      console.log(datas);
      resdatas.push(datas);
      return resolve(datas);
    });
  });
}

module.exports = router;
