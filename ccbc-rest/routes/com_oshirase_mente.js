const request = require("superagent");
const express = require("express");
const router = express.Router();
const async = require("async");
var db = require("./common/sequelize_helper.js").sequelize;
var db2 = require("./common/sequelize_helper.js");

var multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // forever起動時にuploadが正常に動作しないため、暫定対応
    cb(null, "/home/BLOCKCHAIN/ccbc-rest/public/uploads/news");
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
 * 年度リスト取得
 *
 */
router.get("/find", async (req, res) => {
  console.log("OK!");
  console.log("req.params:" + req.params);
  console.log("req.body.Target_year:" + req.body.Target_year);
  const params = [];
  const sql =
    "select renban, title, comment, notice_dt, delete_flg, insert_user_id, insert_tm, update_user_id, update_tm from t_oshirase where delete_flg = '0' order by notice_dt desc";
  query(sql, params, res, req);
});

/**
 *
 * 検索結果表示
 *
 */
router.post("/find", (req, res) => {
  console.log("OK!!");
  console.log("req.params:" + req.params);
  console.log("req.body.targetYear:" + req.body.targetYear);
  const params = [];
  const sql =
    "select renban, title, comment, notice_dt, file_path from t_oshirase where delete_flg = '0' and notice_dt between '" +
    req.body.targetYear +
    "0401' and '" +
    (req.body.targetYear + 1) +
    "0331'" +
    " order by notice_dt desc";
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

  // // トークンチェック
  // var sql =
  //     'select token' +
  //     ' from t_shain tsha' +
  //     " where tsha.delete_flg = '0' and tsha.token = :mytoken"
  // db
  //     .query(sql, {
  //         replacements: { mytoken: req.body.tokenId },
  //         type: db.QueryTypes.RAW
  //     })
  //     .spread(async (datas, metadata) => {
  //         console.log(datas)
  //         if (datas.length == 0) {
  //             console.log('★★★★★トークンチェックエラー')
  //             res.json({ status: false })
  //             return
  //         }
  //     })

  var renban = "";

  db.transaction(async function (tx) {
    var resdatas = [];
    console.log(req);
    var ret = await tOshiraseInsert(tx, resdatas, req);
    renban = ret[0].renban;
    res.json({ status: true, data: resdatas });
  })
    .then((result) => {
      // コミットしたらこっち
      console.log("正常");

      // プッシュ通知先の取得
      const sql =
        "select expo_push_token from t_shain where expo_push_token is not null and delete_flg = '0'";
      db.query(sql, {
        type: db.QueryTypes.RAW,
      }).spread(async (datas, metadata) => {
        for (var i in datas) {
          const pushData = {
            to: datas[i].expo_push_token,
            title: "ComComCoinからのお知らせです",
            body: req.body.title,
            sound: "default",
            badge: 1,
            data: {
              infoRenban: renban,
            },
          };
          request
            .post("https://exp.host/--/api/v2/push/send")
            .send(pushData)
            .end((err, res) => {
              if (err) {
                console.log("com_oshirase_mente:", "Push send error:", err);
              } else {
                console.log("com_oshirase_mente:", "Push send data:", pushData);
              }
            });
        }
      });
    })
    .catch((e) => {
      // ロールバックしたらこっち
      console.log("異常");
      console.log(e);
    });
});

/**
 * ファイルをアップロード
 */
router.post("/upload", upload.fields([{ name: "image" }]), (req, res) => {
  console.log("API : upload - start");
  res.json({
    status: true,
  });
  console.log("API : upload - end");
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
    await tOshiraseUpdate(tx, resdatas, req);
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
    await tOshiraseDelete(tx, resdatas, req);
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
 * t_oshiraseテーブルのinsert用関数
 * @param {*} tx
 * @param {*} resdatas
 * @param {*} req
 */
function tOshiraseInsert(tx, resdatas, req) {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into t_oshirase (title, comment, notice_dt, delete_flg, insert_user_id, insert_tm, update_user_id, update_tm, file_path) " +
      "VALUES (?, ?, ?, ?, ?, current_timestamp, ?, ?, ?) returning renban";

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
        req.body.file_path,
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
 * t_oshiraseテーブルのupdate用関数
 * @param {*} tx
 * @param {*} resdatas
 * @param {*} req
 */
function tOshiraseUpdate(tx, resdatas, req) {
  return new Promise((resolve, reject) => {
    var sql =
      "update t_oshirase set title = ?, comment = ?, notice_dt = ?," +
      "update_user_id = ?, update_tm = current_timestamp, file_path = ? WHERE renban = ?";

    db.query(sql, {
      transaction: tx,
      replacements: [
        req.body.title,
        req.body.comment,
        req.body.notice_dt,
        req.body.userid,
        req.body.file_path,
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
 * t_oshiraseテーブルのdelete用関数
 * @param {*} tx
 * @param {*} resdatas
 * @param {*} req
 */
function tOshiraseDelete(tx, resdatas, req) {
  return new Promise((resolve, reject) => {
    var sql = "update t_oshirase set delete_flg = '1' WHERE renban = ?";

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
