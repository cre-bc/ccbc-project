const request = require("superagent");
const express = require("express");
const router = express.Router();
const async = require("async");
var db = require("./common/sequelize_helper.js").sequelize;
var db2 = require("./common/sequelize_helper.js");
const bcdomain = require("./common/constans.js").bcdomain;

/**
 * 未読記事のプッシュ通知
 */
router.post("/push", (req, res) => {
  pushSend(req, res);
});

/**
 * 未読記事を検索し、Push通知を行う
 * @param req リクエスト
 * @param res レスポンス
 */
async function pushSend(req, res) {
  if (req.body.db_name != null && req.body.db_name != "") {
    db = db2.sequelize3(req.body.db_name);
  } else {
    db = require("./common/sequelize_helper.js").sequelize;
  }

  // プッシュ通知先（未読記事あり）の取得
  const sql =
    "select sha.expo_push_token from t_shain sha where sha.expo_push_token is not null and sha.delete_flg = '0' and exists" +
    " (select * from t_kiji kij" +
    " left join t_kiji_kidoku kid on kij.t_kiji_category_pk = kid.t_kiji_category_pk" +
    " where kid.t_shain_pk = sha.t_shain_pk" +
    " and kij.delete_flg = '0'" +
    " and kij.t_kiji_pk > coalesce(kid.t_kiji_pk, 0))";

  db.query(sql, {
    type: db.QueryTypes.RAW,
  }).spread(async (datas, metadata) => {
    for (var i in datas) {
      const pushData = {
        to: datas[i].expo_push_token,
        title: "ComComCoinからのお知らせです",
        body: "未読の記事があります。楽しい記事が投稿されましたよ！",
        sound: "default",
        badge: 1,
      };
      request
        .post("https://exp.host/--/api/v2/push/send")
        .send(pushData)
        .end((err, res) => {
          if (err) {
            console.log("article_push:", "Push send error:", err);
          } else {
            console.log("article_push:", "Push send data:", pushData);
          }
        });
    }
  });
}
module.exports = router;