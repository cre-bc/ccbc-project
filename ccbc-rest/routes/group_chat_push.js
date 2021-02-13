const request = require("superagent");
const express = require("express");
const router = express.Router();
const async = require("async");
var db = require("./common/sequelize_helper.js").sequelize;
var db2 = require("./common/sequelize_helper.js");
const bcdomain = require("./common/constans.js").bcdomain;

/**
 * グループチャットPush_DB登録
 */
router.post("/create", (req, res) => {
  pushSend(req, res);
});

/**
 * チャットを登録し、Push通知を行う
 * @param req リクエスト
 * @param res レスポンス
 */
async function pushSend(req, res) {
  if (req.body.db_name != null && req.body.db_name != "") {
    db = db2.sequelize3(req.body.db_name);
  } else {
    db = require("./common/sequelize_helper.js").sequelize;
  }
  db.transaction(async function (tx) {
    // チャットテーブルinsert
    var t_chat_pk = await insertChat(tx, req);

    res.json({ status: true, t_chat_pk: t_chat_pk });
  })
    .then((result) => {
      console.log("Push通知");
      var memberList = req.body.resultMemberList;
      console.log(memberList);
      for (var i in memberList) {
        // プッシュ通知
        if (
          memberList[i].expo_push_token !== "" &&
          memberList[i].expo_push_token !== null
        ) {
          const pushData = [
            {
              to: memberList[i].expo_push_token,
              title: req.body.chatGroupNm,
              body: req.body.comment,
              sound: "default",
              badge: 1,
              data: {
                title: req.body.chatGroupNm,
                message: req.body.comment,
                fromShainPk: req.body.loginShainPk,
                fromShimei: req.body.shimei,
                fromImageFileNm: req.body.imageFileName,
                fromExpoPushToken: req.body.expo_push_token,
                chatGroupPk: req.body.chatGroupPk,
                chatGroupNm: req.body.chatGroupNm,
              },
            },
          ];
          request
            .post("https://exp.host/--/api/v2/push/send")
            .send(pushData)
            .end((err, res) => {
              if (err) {
                console.log("chat_coin:", "Push send error:", err);
                console.log("chat_coin:", "Push send data:", pushData);
              }
            });
        }
      }
      // コミットしたらこっち
      console.log("正常");
    })
    .catch((e) => {
      // ロールバックしたらこっち
      console.log("異常");
      console.log(e);
    });
}

/**
 * t_chatテーブルのinsert用関数
 * @param {*} tx
 * @param {*} req
 */
function insertChat(tx, req) {
  return new Promise((resolve, reject) => {
    console.log("★ start insertChat");
    var sql =
      "insert into t_chat (from_shain_pk, to_shain_pk, comment, post_dt, post_tm, t_coin_ido_pk, delete_flg, insert_user_id, insert_tm, update_user_id, update_tm, shonin_cd, t_chat_group_pk) " +
      "VALUES (?, ?, pgp_sym_encrypt(?, 'comcomcoin_chat'), current_timestamp, current_timestamp, ?, ?, ?, current_timestamp, ?, ?, ?, ?) RETURNING t_chat_pk";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }

    db.query(sql, {
      transaction: tx,
      replacements: [
        req.body.loginShainPk,
        0,
        req.body.comment,
        0,
        0,
        req.body.userid,
        null,
        null,
        null,
        req.body.chatGroupPk,
      ],
    }).spread((datas, metadata) => {
      // console.log(datas);
      return resolve(datas[0].t_chat_pk);
    });
    console.log("★ end insertChat");
  });
}

module.exports = router;
