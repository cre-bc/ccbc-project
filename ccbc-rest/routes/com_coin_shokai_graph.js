const request = require("superagent");
const express = require("express");
const router = express.Router();
const async = require("async");
var db = require("./common/sequelize_helper.js").sequelize;
var db2 = require("./common/sequelize_helper.js");
const bcdomain = require("./common/constans.js").bcdomain;

router.post("/find", (req, res) => {
  finddata(req, res);
  console.log("end");
});

/**
 * 初期表示データ取得用関数
 * @req {*} req
 * @res {*} res
 */
async function finddata(req, res) {
  var resdatas = [];
  var bccoin = 0;
  var shimei = null;
  resdatas = await tShainGet(req);
  param = {
    account: resdatas[0].from_bc_account,
    bc_addr: req.body.bc_addr
  };
  bccoin = await bccoinget(param);
  shimei = resdatas[0].fromshimei;
  bcaccount = resdatas[0].fromshimei;
  console.log(bccoin);
  console.log(resdatas);
  console.log(shimei);
  res.json({
    status: true,
    data: resdatas,
    bccoin: bccoin,
    shimei: shimei,
    from_bcaccount: resdatas[0].from_bc_account
  });
}
/**
 * 社員取得用関数
 * @req {*} req
 */
function tShainGet(req) {
  return new Promise((resolve, reject) => {
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    var sql =
      "select row_number() over () as id, *, tsha.t_shain_pk as t_shain_pk, tsha.shimei as shimei, tsha.image_file_nm as image_file_nm, tsha.bc_account as bc_account, null as title, tsha.kengen_cd as kengen_cd, tsha2.bc_account as from_bc_account, tsha2.shimei as fromShimei" +
      " from t_shain tsha, t_shain tsha2 " +
      " where tsha.delete_flg = '0' and tsha2.delete_flg = '0' and tsha.t_shain_pk <> :mypk and tsha2.t_shain_pk = :mypk order by tsha.kengen_cd";
    db
      .query(sql, {
        replacements: { mypk: req.body.tShainPk },
        type: db.QueryTypes.RAW
      })
      .spread((datas, metadata) => {
        console.log("★★★");
        console.log(datas);
        console.log(datas[0].from_bc_account);

        return resolve(datas);
      });
  });
}

// ----------------------------------------------------------------------
/**
 * API : findshokaigraph_event
 * 検索条件イベント用の情報取得
 */
router.post("/findshokaigraph_event", (req, res) => {
  console.log("API : findshokaigraph_event - start");
  findshokaigraph_event(req, res);
  console.log("API : findshokaigraphs_event - end");
});

// ----------------------------------------------------------------------
/**
 * API : findshokaigraph
 * グラフの情報取得
 */
router.post("/findshokaigraph", (req, res) => {
  console.log("API : findshokaigraph - start");
  findshokaigraph(req, res);
  console.log("API : findshokaigraphs - end");
});

// ----------------------------------------------------------------------
/**
 * 初期表示データ取得用関数（イベント取得）
 * グラフの要素は、社員と受領コインと使用コイン
 * @req {*} req
 * @res {*} res
 */
async function findshokaigraph_event(req, res) {
  var resdatas = [];
  var event = null;
  resdatas = await ccCoinEventget(req);
  event = resdatas[0].event;
  console.log(resdatas);
  console.log(event);
  res.json({
    status: true,
    data: resdatas,
    event: event
  });
}

// ----------------------------------------------------------------------
/**
 * データ取得用関数（グラフ情報取得）
 * グラフの要素は、社員と受領コインと使用コイン
 * 課題：所持コインではなく、使用したコインと受領したコインの情報の取得
 * @req {*} req
 * @res {*} res
 */
async function findshokaigraph(req, res) {
  var resdatas = [];
  var bccoin_get = 0;
  var bccoin_use = 0;
  var shimei = null;
  resdatas = await getgraphcoinList(req);
  param = {
    account: resdatas[0].from_bc_account,
    bc_addr: req.body.bc_addr
  };
  bccoin_get = await bccoinget(param);
  bccoin_use = await bccoinget(param);
  shimei = resdatas[0].shimei;
  console.log(bccoin_get);
  console.log(bccoin_use);
  console.log(resdatas);
  console.log(shimei);
  res.json({
    status: true,
    data: resdatas,
    bccoin_get: bccoin_get,
    bccoin_use: bccoin_use,
    shimei: shimei
  });
}

// ----------------------------------------------------------------------
/**
 * イベントの検索条件取得用
 * @req {*} req
 */
function ccCoinEventget(req) {
  return new Promise((resolve, reject) => {
    // SQLとパラメータを指定
    var sql =
      "select distinct(zoyo_comment) as event" +
      "  from t_zoyo" +
      " where delete_flg = '0'" +
      " order by zoyo_comment";
    db
      .query(sql, {
        type: db.QueryTypes.RAW
      })
      .spread((datas, metadata) => {
        console.log("★★★");
        console.log(datas);
        return resolve(datas);
      });
  });
}

// ----------------------------------------------------------------------
/**
 * テーブルよりselect（DBアクセス）
 * グラフ表示用の情報取得
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
function getgraphcoinList(db, req) {
  return new Promise((resolve, reject) => {
    // SQLとパラメータを指定
    var sql =
      "select  tzoyo.zoyo_moto_shain_pk AS sosasha  , tsha1.shimei AS shimei_saki  , tsha1.shimei_kana AS shimei_kana_saki  , tzoyo.zoyo_saki_shain_pk AS torihikisaki  , tsha2.shimei AS shimei_moto  , tsha2.shimei_kana AS shimei_kana_moto  , tzoyo.zoyo_comment AS event  , tzoyo.transaction_id AS transaction_idelect tsha.t_shain_pk as t_shain_pk,tsha.shimei as shimei,tsha.shimei_kana as shimei_kana,tsha.bc_account as bc_account,tsha.kengen_cd as kengen_cd" +
      "from  t_zoyo tzoyo" +
      "left join t_shain tsha1 on tsha1.t_shain_pk = tzoyo.zoyo_moto_shain_pk" +
      "left join t_shain tsha2 on tsha2.t_shain_pk = tzoyo.zoyo_saki_shain_pk" +
      "where tzoyo.delete_flg = '0'" +
      "and to_char(tzoyo.insert_tm,'yyyymm') >= :startmonth";
    ("and to_char(tzoyo.insert_tm,'yyyymm') <= :endmonth");
    "and tzoyo.zoyo_comment = :event" + " order by :sort_graph";
    db
      .query(sql, {
        replacements: {
          startmonth: req.body.startmonth,
          endmonth: req.body.endmonth,
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
/**
 * 取引情報取得用関数
 * @param {*} param
 * 受領コインと使用コインをグラフに出力用
 */

function bctransactionsget() {
  return new Promise((resolve, reject) => {
    request
      .post(bcdomain + "/get_transactions")
      .send(param)
      .end((err, res) => {
        console.log("★★★");
        if (err) {
          console.log("★" + err);
          return;
        }
        console.log("★★★" + res.body.coin);
        return resolve(res.body.coin);
      });
  });
}

// ----------------------------------------------------------------------
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
        console.log("★★★");
        if (err) {
          console.log("★" + err);
          return;
        }
        console.log("★★★" + res.body.coin);
        return resolve(res.body.coin);
      });
  });
}

router.post("/create", (req, res) => {
  console.log("◆◆◆");
  if (req.body.db_name != null && req.body.db_name != "") {
    db = db2.sequelize3(req.body.db_name);
  } else {
    db = require("./common/sequelize_helper.js").sequelize;
  }

  // トークンチェック
  var sql =
    "select token" +
    " from t_shain tsha" +
    " where tsha.delete_flg = '0' and tsha.token = :mytoken";
  db
    .query(sql, {
      replacements: { mytoken: req.body.tokenId },
      type: db.QueryTypes.RAW
    })
    .spread(async (datas, metadata) => {
      console.log(datas);
      if (datas.length == 0) {
        console.log("トークンチェックエラー");
        res.json({ status: false });
        return;
      }
    });

  db
    .transaction(async function(tx) {
      var resdatas = [];
      await tZoyoInsert(tx, resdatas, req);
      var transaction_id = await bcrequest(req);
      await dbupdate(tx, transaction_id, req);
      res.json({ status: true, data: resdatas });
    })
    .then(result => {
      // コミットしたらこっち
      console.log("正常");
    })
    .catch(e => {
      // ロールバックしたらこっち
      console.log("異常");
      console.log(e);
    });
});

module.exports = router;
