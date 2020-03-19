const request = require("superagent");
const express = require("express");
const router = express.Router();
const async = require("async");
var db = require("./common/sequelize_helper.js").sequelize;
var db2 = require("./common/sequelize_helper.js");

/**
 * チャット_初期表示
 */
router.post("/find", (req, res) => {
  console.log("OK");
  console.log(req.params);
  findData(req, res);
});

/**
 * チャット_既読更新
 */
router.post("/kidoku_update", (req, res) => {
  console.log("OK");
  console.log(req.params);
  updateKidoku(req, res);
});

/**
 * チャット_DB登録
 */
router.post("/create", (req, res) => {
  // console.log("◆◆◆");
  // var resultList = req.body.resultList
  if (req.body.db_name != null && req.body.db_name != "") {
    db = db2.sequelize3(req.body.db_name);
  } else {
    db = require("./common/sequelize_helper.js").sequelize;
  }
  db
    .transaction(async function (tx) {
      // チャットテーブルinsert
      var t_chat_pk = await insertChat(tx, req);
      // console.log("t_chat_pk:", t_chat_pk);
      // チャット既読テーブル更新
      // await updateChatKidoku(
      //   req,
      //   t_chat_pk,
      //   req.body.loginShainPk,
      //   req.body.fromShainPk
      // )
      res.json({ status: true });
      // console.log("res.json:", res.json);
    })
    .then(result => {
      // プッシュ通知
      if (req.body.fromExpoPushToken !== "" && req.body.fromExpoPushToken !== null) {
        request
          .post("https://exp.host/--/api/v2/push/send")
          .send([
            {
              to: req.body.fromExpoPushToken,
              title: req.body.shimei,
              body: req.body.message,
              data: {
                title: req.body.shimei,
                message: req.body.message,
                fromShainPk: req.body.loginShainPk,
                fromShimei: req.body.shimei,
                fromImageFileNm: req.body.imageFileName,
                fromExpoPushToken: req.body.expo_push_token
              }
            }])
          .end((err, res) => {
            if (err) {
              console.log("chat_msg:", "Push send error:", err)
            }
          });
      }
      // コミットしたらこっち
      console.log("正常");
    })
    .catch(e => {
      // ロールバックしたらこっち
      console.log("異常");
      console.log(e);
    });
});

/**
 * データ取得用関数
 *
 * @param {*} req
 * @param {*} res
 */
async function findData(req, res) {
  console.log("★findData★");

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
  // console.log(chatPk);
  // console.log(fromShainPk);
  // console.log(toShainPk);

  var maxChatPk = chatPk[0].max;
  // console.log(maxChatPk);

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
      console.log("チャット既読insert（本人）");
      // チャット既読テーブルinsert（本人）
      await insertChatKidoku(req, userid, fromShainPk, toShainPk);
    }
    if (resultKidokuData2.length === 0) {
      console.log("チャット既読insert（相手）");
      // チャット既読テーブルinsert（本人）
      await insertChatKidoku(req, userid, toShainPk, fromShainPk);
    }
  }

  // console.log(resultData);

  res.json({ status: true, data: resultData, kidokuData: resultKidokuData });
}

/**
 * 既読更新用関数
 *
 * @param {*} req
 * @param {*} res
 */
async function updateKidoku(req, res) {
  console.log("★updateKidoku★");

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
      console.log("チャット既読insert（本人）");
      // チャット既読テーブルinsert（本人）
      await insertChatKidoku(req, userid, fromShainPk, toShainPk);
    }
    if (resultKidokuData2.length === 0) {
      console.log("チャット既読insert（相手）");
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
    console.log("★ start chatMsgGet★");
    // var sql =
    //   'select c.t_chat_pk, c.from_shain_pk, c.to_shain_pk, c.comment, c.post_dt, c.post_tm, c.post_dt + c.post_tm as post_dttm, c.t_coin_ido_pk, k.t_chat_pk as kidoku_pk from t_chat c left join t_chat_kidoku k on c.from_shain_pk = k.from_shain_pk and c.to_shain_pk = k.t_shain_pk where (c.from_shain_pk = :fromPk and c.to_shain_pk = :myPk) or (c.from_shain_pk = :myPk and c.to_shain_pk = :fromPk) order by post_dt + post_tm desc'
    var sql =
      "select c.t_chat_pk, c.from_shain_pk, c.to_shain_pk, c.comment, c.post_dt, c.post_tm, c.post_dt + c.post_tm as post_dttm, c.t_coin_ido_pk from t_chat c where (c.from_shain_pk = :fromPk and c.to_shain_pk = :myPk) or (c.from_shain_pk = :myPk and c.to_shain_pk = :fromPk) order by post_dt + post_tm desc";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db
      .query(sql, {
        replacements: {
          myPk: req.body.loginShainPk,
          fromPk: req.body.fromShainPk
        },
        type: db.QueryTypes.RAW
      })
      .spread(async (datas, metadata) => {
        console.log("★End chatMsgGet");
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
    console.log("★ start chatKidokuGet");
    var sql =
      "select k.t_chat_pk as kidoku_pk from t_chat_kidoku k where k.from_shain_pk = :fromPk and k.t_shain_pk = :myPk ";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db
      .query(sql, {
        replacements: {
          myPk: toShainPk,
          fromPk: fromShainPk
        },
        type: db.QueryTypes.RAW
      })
      .spread(async (datas, metadata) => {
        console.log("★End chatKidokuGet");
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
    console.log("★ start chatPkGet");
    var sql =
      "select max(c.t_chat_pk) from t_chat c where c.from_shain_pk = :fromPk and c.to_shain_pk = :myPk";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db
      .query(sql, {
        replacements: {
          myPk: req.body.loginShainPk,
          fromPk: req.body.fromShainPk
        },
        type: db.QueryTypes.RAW
      })
      .spread(async (datas, metadata) => {
        console.log("★End chatPkGet");
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
    console.log("★ start updateChatKidoku★");
    var sql =
      "update t_chat_kidoku set t_chat_pk = :chatPk, update_user_id = :userId, update_tm = current_timestamp where from_shain_pk = :fromPk and t_shain_pk = :myPk";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db
      .query(sql, {
        replacements: {
          chatPk: maxChatPk,
          myPk: toShainPk,
          fromPk: fromShainPk,
          userId: req.body.userid
        },
        type: db.QueryTypes.RAW
      })
      .spread(async (datas, metadata) => {
        console.log("★End updateChatKidoku★");
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
      "insert into t_chat_kidoku (t_shain_pk, from_shain_pk, t_chat_pk, insert_user_id, insert_tm, update_user_id, update_tm) " +
      "VALUES (?, ?, ?, ?, current_timestamp, ?, ?) ";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }

    db
      .query(sql, {
        replacements: [toShainPk, fromShainPk, 0, userid, null, null]
      })
      .spread((datas, metadata) => {
        // console.log(datas);
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
    var sql =
      "insert into t_chat (from_shain_pk, to_shain_pk, comment, post_dt, post_tm, t_coin_ido_pk, delete_flg, insert_user_id, insert_tm, update_user_id, update_tm) " +
      "VALUES (?, ?, ?, current_timestamp, current_timestamp, ?, ?, ?, current_timestamp, ?, ?) RETURNING t_chat_pk";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }

    db
      .query(sql, {
        transaction: tx,
        replacements: [
          req.body.loginShainPk,
          req.body.fromShainPk,
          req.body.message,
          0,
          0,
          req.body.userid,
          null,
          null
        ]
      })
      .spread((datas, metadata) => {
        // console.log(datas);
        return resolve(datas[0].t_chat_pk);
      });
  });
}
module.exports = router;
