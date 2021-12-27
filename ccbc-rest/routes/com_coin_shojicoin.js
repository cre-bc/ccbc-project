const request = require("superagent");
const express = require("express");
const router = express.Router();
const async = require("async");
var db = require("./common/sequelize_helper.js").sequelize;
var db2 = require("./common/sequelize_helper.js");
const bcdomain = require("./common/constans.js").bcdomain;

/**
 * API : findgraphcoin
 * 所持コイン一覧に表示する情報を取得
 */
router.post("/findshojicoin", (req, res) => {
  findshojicoin(req, res);
});

/**
 * データ取得用関数（グラフ情報取得）
 * グラフの要素は、社員と所持コインのみ
 * @req {*} req
 * @res {*} res
 */
async function findshojicoin(req, res) {
  var resdatas = [];
  var bccoin = 0;

  // BCアカウントを取得
  resdatas = await bcAccountGet(db, req);

  for (let i in resdatas) {
    var param = {
      account: resdatas[i].bc_account,
      bc_addr: req.body.bc_addr,
    };
    // BCコイン数を取得
    bccoin = await bccoinget(param);
    resdatas[i].sakicoin = Number(bccoin);
  }

  res.json({
    status: true,
    data: resdatas,
  });
}

/**
 * テーブルよりselect（DBアクセス）
 * グラフ表示用の情報取得（グラフの基本となる社員情報）
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
function bcAccountGet(db, req) {
  return new Promise((resolve, reject) => {
    // SQLとパラメータを指定
    var sql =
      "select " +
      "tsha.t_shain_pk" +
      ", tsha.shimei" +
      ", tsha.shimei_kana " +
      ", tsha.bc_account as bc_account " +
      "from " +
      "t_shain tsha " +
      "where tsha.delete_flg = '0' " +
      "and tsha.t_shain_pk <> '1' ";
    db.query(sql, {
      replacements: {
        sort_graph: req.body.sort_graph,
      },
      type: db.QueryTypes.RAW,
    }).spread((datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * BCコイン取得用関数
 * @param {*} param
 */
function bccoinget(param) {
  return new Promise((resolve, reject) => {
    request
      .post(bcdomain + "/bc-api/get_coin")
      .send(param)
      .end((err, res) => {
        if (err) {
          console.log("★" + err);
          return;
        }
        // console.log("★★★" + res.body.coin);
        return resolve(res.body.coin);
      });
  });
}

module.exports = router;
