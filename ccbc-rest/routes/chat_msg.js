const request = require("superagent");
const express = require("express");
const router = express.Router();
const async = require("async");
var db = require("./common/sequelize_helper.js").sequelize;
var db2 = require("./common/sequelize_helper.js");
var mainte = require("./common/maintenance_helper.js");

var multer = require('multer')
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // forever起動時にuploadが正常に動作しないため、暫定対応
    cb(null, '/home/BLOCKCHAIN/ccbc-rest/public/uploads/chat')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({ storage: storage })

/**
 * チャット_初期表示
 */
router.post("/find", async (req, res) => {
  var mntRes = await mainte.checkAppStatus(req)
  if (mntRes != null) {
    res.json(mntRes);
    return;
  }

  findData(req, res);
});

/**
 * チャット_既読更新
 */
router.post("/kidoku_update", async (req, res) => {
  var mntRes = await mainte.checkAppStatus(req)
  if (mntRes != null) {
    res.json(mntRes);
    return;
  }

  updateKidoku(req, res);
});

/**
 * チャット_DB登録
 */
router.post("/create", async (req, res) => {
  var mntRes = await mainte.checkAppStatus(req)
  if (mntRes != null) {
    res.json(mntRes);
    return;
  }

  if (req.body.db_name != null && req.body.db_name != "") {
    db = db2.sequelize3(req.body.db_name);
  } else {
    db = require("./common/sequelize_helper.js").sequelize;
  }
  db.transaction(async function (tx) {
    // チャットテーブルinsert
    var t_chat_pk = await insertChat(tx, req);
    res.json({ status: true });
  })
    .then((result) => {
      // プッシュ通知
      if (
        req.body.fromExpoPushToken !== "" &&
        req.body.fromExpoPushToken !== null
      ) {
        var pushData = [];
        if (req.body.filePath != null && req.body.filePath != "") {
          pushData.push({
            to: req.body.fromExpoPushToken,
            title: req.body.shimei,
            body: "写真が送信されました",
            sound: "default",
            badge: 1,
            data: {
              title: req.body.shimei,
              message: "写真が送信されました",
              fromShainPk: req.body.loginShainPk,
              fromShimei: req.body.shimei,
              fromImageFileNm: req.body.imageFileName,
              fromExpoPushToken: req.body.expo_push_token,
            },
          },
          );
        } else {
          pushData = [
            {
              to: req.body.fromExpoPushToken,
              title: req.body.shimei,
              body: req.body.message,
              sound: "default",
              badge: 1,
              data: {
                title: req.body.shimei,
                message: req.body.message,
                fromShainPk: req.body.loginShainPk,
                fromShimei: req.body.shimei,
                fromImageFileNm: req.body.imageFileName,
                fromExpoPushToken: req.body.expo_push_token,
              },
            },
          ];
        }

        request
          .post("https://exp.host/--/api/v2/push/send")
          .send(pushData)
          .end((err, res) => {
            if (err) {
              console.log("chat_msg:", "Push send error:", err);
              console.log("chat_msg:", "Push send data:", pushData);
            }
          });
      }
    })
    .catch((e) => {
      // ロールバックしたらこっち
      console.log("異常");
      console.log(e);
    });
});

/**
 * API : upload
 * チャット画像のファイルをアップロード
 */
router.post('/upload', upload.fields([{ name: 'image' }]), (req, res) => {
  res.json({
    status: true
  })
})

/**
 * データ取得用関数
 *
 * @param {*} req
 * @param {*} res
 */
async function findData(req, res) {
  var resultData = [];
  var chatPk = [];
  var resultKidokuData = [];
  var resultKidokuData2 = [];
  var userid = req.body.userid;
  var fromShainPk = req.body.fromShainPk;
  var toShainPk = req.body.loginShainPk;

  // チャットを取得
  resultData = await chatMsgGet(req);

  // 最大チャットPKを取得
  chatPk = await chatPkGet(req);

  var maxChatPk = chatPk[0].max;

  //チャットが存在する場合
  if (maxChatPk != null) {
    // チャット既読テーブル更新
    await updateChatKidoku(req, maxChatPk, fromShainPk, toShainPk);
  } else {
    // 既読チャットPKを取得(本人)
    resultKidokuData = await chatKidokuGet(req, fromShainPk, toShainPk);
    // 既読チャットPKを取得(相手)
    resultKidokuData2 = await chatKidokuGet(req, toShainPk, fromShainPk);

    if (resultKidokuData.length === 0) {
      // チャット既読テーブルinsert（本人）
      await insertChatKidoku(req, userid, fromShainPk, toShainPk);
    }
    if (resultKidokuData2.length === 0) {
      // チャット既読テーブルinsert（本人）
      await insertChatKidoku(req, userid, toShainPk, fromShainPk);
    }
  }
  res.json({ status: true, data: resultData, kidokuData: resultKidokuData });
}

/**
 * 既読更新用関数
 *
 * @param {*} req
 * @param {*} res
 */
async function updateKidoku(req, res) {
  var chatPk = [];
  var resultKidokuData = [];
  var resultKidokuData2 = [];
  var userid = req.body.userid;
  var fromShainPk = req.body.fromShainPk;
  var toShainPk = req.body.loginShainPk;

  // 最大チャットPKを取得
  chatPk = await chatPkGet(req);

  var maxChatPk = chatPk[0].max;

  //チャットが存在する場合
  if (maxChatPk != null) {
    // チャット既読テーブル更新
    await updateChatKidoku(req, maxChatPk, fromShainPk, toShainPk);
  } else {
    // 既読チャットPKを取得(本人)
    resultKidokuData = await chatKidokuGet(req, fromShainPk, toShainPk);
    // 既読チャットPKを取得(相手)
    resultKidokuData2 = await chatKidokuGet(req, toShainPk, fromShainPk);

    if (resultKidokuData.length === 0) {
      // チャット既読テーブルinsert（本人）
      await insertChatKidoku(req, userid, fromShainPk, toShainPk);
    }
    if (resultKidokuData2.length === 0) {
      // チャット既読テーブルinsert（本人）
      await insertChatKidoku(req, userid, toShainPk, fromShainPk);
    }
  }

  res.json({ status: true });
}

/**
 * チャット取得用関数
 *
 * @param {*} req
 */
async function chatMsgGet(req) {
  return new Promise((resolve, reject) => {
    var sql =
      "select c.t_chat_pk, c.from_shain_pk, c.to_shain_pk, pgp_sym_decrypt(c.comment, 'comcomcoin_chat') as comment, c.post_dt, c.post_tm, c.post_dt + c.post_tm as post_dttm, c.t_coin_ido_pk, file_path from t_chat c where (c.from_shain_pk = :fromPk and c.to_shain_pk = :myPk) or (c.from_shain_pk = :myPk and c.to_shain_pk = :fromPk) and c.t_chat_group_pk = 0 order by post_dt + post_tm desc";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db.query(sql, {
      replacements: {
        myPk: req.body.loginShainPk,
        fromPk: req.body.fromShainPk,
      },
      type: db.QueryTypes.RAW,
    }).spread(async (datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * チャット既読取得用関数
 *
 * @param {*} req
 */
async function chatKidokuGet(req, fromShainPk, toShainPk) {
  return new Promise((resolve, reject) => {
    var sql =
      "select k.t_chat_pk as kidoku_pk from t_chat_kidoku k where k.from_shain_pk = :fromPk and k.t_shain_pk = :myPk and from_chat_group_pk = 0";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db.query(sql, {
      replacements: {
        myPk: toShainPk,
        fromPk: fromShainPk,
      },
      type: db.QueryTypes.RAW,
    }).spread(async (datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * チャットPK取得用関数
 *
 * @param {*} req
 */
async function chatPkGet(req) {
  return new Promise((resolve, reject) => {
    var sql =
      "select max(c.t_chat_pk) from t_chat c where c.from_shain_pk = :fromPk and c.to_shain_pk = :myPk and c.t_chat_group_pk = 0";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db.query(sql, {
      replacements: {
        myPk: req.body.loginShainPk,
        fromPk: req.body.fromShainPk,
      },
      type: db.QueryTypes.RAW,
    }).spread(async (datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * チャット既読テーブル更新用関数
 *
 * @param {*} req
 */
async function updateChatKidoku(req, maxChatPk, fromShainPk, toShainPk) {
  return new Promise((resolve, reject) => {
    var sql =
      "update t_chat_kidoku set t_chat_pk = :chatPk, update_user_id = :userId, update_tm = current_timestamp where from_shain_pk = :fromPk and t_shain_pk = :myPk and from_chat_group_pk = 0";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db.query(sql, {
      replacements: {
        chatPk: maxChatPk,
        myPk: toShainPk,
        fromPk: fromShainPk,
        userId: req.body.userid,
      },
      type: db.QueryTypes.RAW,
    }).spread(async (datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * チャット既読テーブルinsert用関数
 * @param {*} tx
 * @param {*} req
 */
function insertChatKidoku(req, userid, fromShainPk, toShainPk) {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into t_chat_kidoku (t_shain_pk, from_shain_pk, t_chat_pk, insert_user_id, insert_tm, update_user_id, update_tm, from_chat_group_pk) " +
      "VALUES (?, ?, ?, ?, current_timestamp, ?, ?, 0) ";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }

    db.query(sql, {
      replacements: [toShainPk, fromShainPk, 0, userid, null, null],
    }).spread((datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * t_chatテーブルのinsert用関数
 * @param {*} tx
 * @param {*} req
 */
function insertChat(tx, req) {
  return new Promise((resolve, reject) => {
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    // 画像を送信する場合
    if (req.body.filePath != null && req.body.filePath != "") {
      var sql =
        "insert into t_chat (from_shain_pk, to_shain_pk, comment, post_dt, post_tm, t_coin_ido_pk, delete_flg, insert_user_id, insert_tm, update_user_id, update_tm, shonin_cd, t_chat_group_pk, file_path) " +
        "VALUES (?, ?, ?, current_timestamp, current_timestamp, ?, ?, ?, current_timestamp, ?, ?, ?, ?, ?) RETURNING t_chat_pk";
      db.query(sql, {
        transaction: tx,
        replacements: [
          req.body.loginShainPk,
          req.body.fromShainPk,
          null,
          0,
          0,
          req.body.userid,
          null,
          null,
          null,
          0,
          req.body.filePath
        ],
      }).spread((datas, metadata) => {
        return resolve(datas[0].t_chat_pk);
      });
      // 通常のチャットメッセージ送信
    } else {
      var sql =
        "insert into t_chat (from_shain_pk, to_shain_pk, comment, post_dt, post_tm, t_coin_ido_pk, delete_flg, insert_user_id, insert_tm, update_user_id, update_tm, shonin_cd, t_chat_group_pk, file_path) " +
        "VALUES (?, ?, pgp_sym_encrypt(?, 'comcomcoin_chat'), current_timestamp, current_timestamp, ?, ?, ?, current_timestamp, ?, ?, ?, ?, ?) RETURNING t_chat_pk";
      db.query(sql, {
        transaction: tx,
        replacements: [
          req.body.loginShainPk,
          req.body.fromShainPk,
          req.body.message,
          0,
          0,
          req.body.userid,
          null,
          null,
          null,
          0,
          null
        ],
      }).spread((datas, metadata) => {
        return resolve(datas[0].t_chat_pk);
      });
    }
  });
}
module.exports = router;
