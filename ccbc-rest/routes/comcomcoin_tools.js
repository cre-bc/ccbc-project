const request = require("superagent");
const express = require("express");
const router = express.Router();
const async = require("async");
var db = require("./common/sequelize_helper.js").sequelize;
var db2 = require("./common/sequelize_helper.js");
const bcdomain = require("./common/constans.js").bcdomain;

// ----- コインチェッカー -----
/**
 * API : findList
 * 社員リストを取得
 */
router.post("/findList", (req, res) => {
  console.log("API : findList - start");
  findList(req, res);
  console.log("API : findList - end");
});

// ----------------------------------------------------------------------
// ----- コインチェッカー -----
/**
 * 社員リストを取得
 * @param req リクエスト
 * @param res レスポンス
 */
async function findList(req, res) {
  var resdatas = await selectEmployeeList(db, req);
  for (var i = 0; i < resdatas.length; i++) {
    // 保有コインの取得
    const coin = await bcGetCoin(resdatas[i].bc_account);
    resdatas[i].coin = coin;

    // 異動コインの取得
    resdatas[i].coin_article = 0;
    resdatas[i].coin_shopping = 0;
    resdatas[i].coin_chat_sendcoin = 0;
    resdatas[i].coin_chat_receivecoin = 0;

    // 贈与テーブルよりBCトランザクションを取得
    var resTrans = await selectBcTransactionList(
      db,
      resdatas[i].t_shain_pk,
      req.body.from_dt,
      req.body.to_dt
    );
    var trans = [];
    for (var j = 0; j < resTrans.length; j++) {
      trans.push(resTrans[j].transaction_id);
    }
    // BCより対象トランザクションの異動コイン数を取得
    var resCoins = await bcGetCoinTrans(trans);
    for (var j = 0; j < resTrans.length; j++) {
      if (resTrans[j].nenji_flg === "2") {
        // 記事投稿
        resdatas[i].coin_article += resCoins.body.trans[j].coin;
      } else if (resTrans[j].nenji_flg === "4") {
        // 買い物
        resdatas[i].coin_shopping += resCoins.body.trans[j].coin;
      } else if (resTrans[j].nenji_flg === "3") {
        if (resTrans[j].zoyo_moto_shain_pk === resdatas[i].t_shain_pk) {
          // コイン送付
          resdatas[i].coin_chat_sendcoin += resCoins.body.trans[j].coin;
        } else {
          // コイン受取
          resdatas[i].coin_chat_receivecoin += resCoins.body.trans[j].coin;
        }
      }
    }
  }
  console.log("resdatas:", resdatas);
  res.json({
    status: true,
    data: resdatas,
  });
}

// ----------------------------------------------------------------------
// ----- コインチェッカー -----
/**
 * 社員テーブルよりselect（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
function selectEmployeeList(db, req) {
  return new Promise((resolve, reject) => {
    // SQLとパラメータを指定
    var sql = "select *" + " from t_shain" + " order by t_shain_pk";
    db.query(sql, {
      type: db.QueryTypes.RAW,
    }).spread((datas, metadata) => {
      console.log("DBAccess : selectEmployeeList result...");
      return resolve(datas);
    });
  });
}

/**
 * 贈与テーブルよりselect（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param shain_pk 社員PK
 * @param from_dt 抽出範囲From
 * @param to_dt 抽出範囲To
 */
function selectBcTransactionList(db, shain_pk, from_dt, to_dt) {
  return new Promise((resolve, reject) => {
    // SQLとパラメータを指定
    var sql =
      "select *" +
      " from t_zoyo" +
      " where (zoyo_moto_shain_pk = " +
      shain_pk +
      " or zoyo_saki_shain_pk = " +
      shain_pk +
      ")" +
      " and nenji_flg in ('2', '3', '4')" +
      " and delete_flg = '0'" +
      " and insert_tm between '" +
      from_dt +
      "' and '" +
      to_dt +
      "'" +
      " order by insert_tm";
    db.query(sql, {
      type: db.QueryTypes.RAW,
    }).spread((datas, metadata) => {
      console.log("DBAccess : selectBcTransactionList result...");
      return resolve(datas);
    });
  });
}

/**
 * BCコイン取得関数
 * @param account アカウント
 */
function bcGetCoin(account) {
  return new Promise((resolve, reject) => {
    var param = {
      account: account,
    };
    console.log("bcrequest.param:", param);
    request
      .post(bcdomain + "/bc-api/get_coin")
      .send(param)
      .end((err, res) => {
        if (err) {
          console.log("bcrequest.err:", err);
          return;
        }
        // 検索結果表示
        console.log("bcrequest.result.coin:", res.body.coin);
        return resolve(res.body.coin);
      });
  });
}

/**
 * BCコイン取得用関数
 * @param transactions トランザクション（配列）
 */
function bcGetCoinTrans(transactions) {
  return new Promise((resolve, reject) => {
    var param = {
      transaction: transactions,
    };
    console.log("bcrequest.param:", param);
    request
      .post(bcdomain + "/bc-api/get_transactions")
      .send(param)
      .end((err, res) => {
        if (err) {
          console.log("bcrequest.err:", err);
          return;
        }
        return resolve(res);
      });
  });
}

module.exports = router;
