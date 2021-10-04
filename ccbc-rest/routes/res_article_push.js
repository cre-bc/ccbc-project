const request = require("superagent");
const express = require("express");
const router = express.Router();
const async = require("async");
var db = require("./common/sequelize_helper.js").sequelize;
var db2 = require("./common/sequelize_helper.js");
const bcdomain = require("./common/constans.js").bcdomain;

/**
 * 未読レスのプッシュ通知
 */
router.post("/push", (req, res) => {
  pushResSend(req, res);
  res.json({
    status: true
  });
});

/**
 * 未読レスを検索し、Push通知を行う
 * @param req リクエスト
 * @param res レスポンス
 */
async function pushResSend(req, res) {
  if (req.body.db_name != null && req.body.db_name != "") {
    db = db2.sequelize3(req.body.db_name);
  } else {
    db = require("./common/sequelize_helper.js").sequelize;
  }

  // プッシュ通知先（未読レスあり）の取得
  const sql =
    "select sha.t_shain_pk, sha.expo_push_token from t_shain sha" +
    " left join t_kiji kij on sha.t_shain_pk = kij.t_shain_pk" +
    " left join t_response res1 on kij.t_kiji_pk = res1.t_kiji_pk" +
    " left join t_response res2 on sha.t_shain_pk = res2.to_shain_pk" +
    " where sha.expo_push_token is not null and sha.delete_flg = '0'" +
    " and ((res1.t_response_pk > coalesce((select t_response_pk from t_response_kidoku kid where kid.t_kiji_pk = res1.t_kiji_pk and kid.t_shain_pk = sha.t_shain_pk), 0))" +
    "  or (res2.t_response_pk > coalesce((select t_response_pk from t_response_kidoku kid where kid.t_kiji_pk = res2.t_kiji_pk and kid.t_shain_pk = sha.t_shain_pk), 0)))" +
    " group by sha.t_shain_pk, sha.expo_push_token";
  db.query(sql, {
    type: db.QueryTypes.RAW,
  }).spread(async (datas, metadata) => {
    for (var i in datas) {
      const pushData = {
        to: datas[i].expo_push_token,
        title: "ComComCoinからのお知らせです",
        body: "新しいコメントがありますよ！！",
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
