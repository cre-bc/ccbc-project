const request = require("superagent");
const express = require("express");
const router = express.Router();
const async = require("async");
var db = require("./common/sequelize_helper.js").sequelize;
var db2 = require("./common/sequelize_helper.js");
const bcdomain = require("./common/constans.js").bcdomain;

// ----------------------------------------------------------------------
/**
 * API : findgraphcoin
 * 所持コイン一覧に表示する情報を取得
 */
router.post("/findshojicoin", (req, res) => {
  console.log("API : findshojicoin - start");
  findshojicoin(req, res);
  console.log("API : findshojicoin - end");
});

// ----------------------------------------------------------------------
/**
 * データ取得用関数（グラフ情報取得）
 * グラフの要素は、社員と所持コインのみ
 * @req {*} req
 * @res {*} res
 */
async function findshojicoin(req, res) {
  var resdatas = [];
  var resbccoin = [];
  var sakicoin_sum = 0;

  console.log("API : findshojicoin →中身");

  //社員リストの情報取得
  resdatas = await getshainList(db, req);
  //贈与テーブルより、取引情報取得（所持コイン）
  resbccoin = await getshojicoinList(db, req);

  console.log(resdatas);
  console.log(resbccoin);

  var trans = []
  var lengthData = []
  for (let i in resdatas) {
    var cnt = 0
    for (let n in resbccoin) {
      if (resdatas[i].t_shain_pk === resbccoin[n].zoyo_saki_shain_pk) {
        trans.push(resbccoin[n].transaction_id)
        cnt++
      }
    }
    lengthData.push(cnt)
  }
  var param = {
    transaction: trans
  }
  var sakicoin = await bctransactionsget(param)

  var index = 0
  for (var i in resdatas) {
    var length = index + lengthData[i]
    for (var j = index; j < length; j++) {
      sakicoin_sum += sakicoin.body.trans[j].coin
    }
    // 社員に紐づく受領コインの合計をセット
    resdatas[i].sakicoin = sakicoin_sum
    sakicoin_sum = 0
    index = length
  }

  // この時点で、社員リストを基としたresdatasには、社員に紐づく所持コイン（sakicoin）が紐づいている
  console.log(resdatas);
  res.json({
    status: true,
    data: resdatas
  });
}

// ----------------------------------------------------------------------
/**
 * テーブルよりselect（DBアクセス）
 * グラフ表示用の情報取得（グラフの基本となる社員情報）
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
function getshainList(db, req) {
  return new Promise((resolve, reject) => {
    // SQLとパラメータを指定
    console.log("API : getshainList →中身");
    console.log(req.body.sort_graph);

    var sql =
      "select " +
      "tsha.t_shain_pk" +
      ", tsha.shimei" +
      ", tsha.shimei_kana " +
      "from " +
      "t_shain tsha " +
      "where tsha.delete_flg = '0' " +
      "and tsha.t_shain_pk <> '1' "
    db
      .query(sql, {
        replacements: {
          sort_graph: req.body.sort_graph
        },
        type: db.QueryTypes.RAW
      })
      .spread((datas, metadata) => {
        console.log("DBAccess : getshojicoinList result...");
        console.log(datas);
        return resolve(datas);
      });
  });
}

// ----------------------------------------------------------------------
// 所持コイン一覧は、検索条件なしで、社員とコイン情報のみ取得しグラフに表示
/**
 * テーブルよりselect（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
function getshojicoinList(db, req) {
  return new Promise((resolve, reject) => {
    // SQLとパラメータを指定
    var sql =
      "select " +
      "tzoyo.zoyo_moto_shain_pk" +
      ", tsha1.shimei AS shimei_saki" +
      ", tsha1.shimei_kana AS shimei_kana_saki" +
      ", tzoyo.zoyo_saki_shain_pk" +
      ", tsha2.shimei AS shimei_moto" +
      ", tsha2.shimei_kana AS shimei_kana_moto" +
      ", tzoyo.zoyo_comment AS event" +
      ", tzoyo.transaction_id" +
      ", tsha1.t_shain_pk as t_shain_pk" +
      ", tsha1.shimei as shimei" +
      ", tsha1.shimei_kana as shimei_kana" +
      ", tsha1.bc_account as bc_account" +
      ", tsha1.kengen_cd as kengen_cd " +
      "from t_zoyo tzoyo " +
      "left join t_shain tsha1 " +
      "on tsha1.t_shain_pk = tzoyo.zoyo_moto_shain_pk " +
      "left join t_shain tsha2 " +
      "on tsha2.t_shain_pk = tzoyo.zoyo_saki_shain_pk " +
      "where tzoyo.delete_flg = '0';"
    db
      .query(sql, {
        replacements: { sort_graph: req.body.sort_graph },
        type: db.QueryTypes.RAW
      })
      .spread((datas, metadata) => {
        console.log("DBAccess : getshojicoinList result...");
        console.log(datas);
        return resolve(datas);
      });
  });
}

// ----------------------------------------------------------------------
/**
 * 取引情報取得用関数
 * @param {*} param
 * 受領コインと使用コインをグラフに出力用
 */

function bctransactionsget(param) {
  return new Promise((resolve, reject) => {
    request
      .post(bcdomain + "/bc-api/get_transactions")
      .send(param)
      .end((err, res) => {
        console.log("★★★");
        if (err) {
          console.log("★" + err);
          return;
        }
        console.log("★★★" + res.body.trans);
        return resolve(res);
      });
  });
}

module.exports = router;