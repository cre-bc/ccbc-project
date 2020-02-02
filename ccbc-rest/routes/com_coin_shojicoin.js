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

// ----------------------------------------------------------------------
/**
 * API : findgraphcoin
 * 所持コイン一覧に表示する情報を取得
 */
router.post("/findshojicoin", (req, res) => {
  console.log("API : findshojicoin - start");
  findshojicoindata(req, res);
  console.log("API : findshojicoin - end");
});

// ----------------------------------------------------------------------
/**
 * 比較関数
 * 数値でソートが動かない場合使用する
 */
function compareFunc(a, b) {
  return a < b;
}

// ----------------------------------------------------------------------
/**
 * データ取得用関数（グラフ情報取得）
 * グラフの要素は、社員と所持コインのみ
 * @req {*} req
 * @res {*} res
 */
async function findshojicoindata(req, res) {
  var resdatas = [];
  var bccoin = 0;
  var shimei = null;
  resdatas = await getshojicoinList(req);
  param = {
    account: resdatas[0].from_bc_account,
    bc_addr: req.body.bc_addr
  };
  bccoin = await bccoinget(param);
  shimei = resdatas[0].shimei;

  //** webで設定したsort_graphにより所持コインをソート */
  if ((sort_graph = "1")) {
    //所持コインの順にソート（昇順）
    resdatas.sort(function(a, b) {
      if (a.bccoin < b.bccoin) return -1;
      if (a.bccoin > b.bccoin) return 1;
      return 0;
    });
  } else if ((sort_graph = "2")) {
    //所持コインの順にソート（降順）
    resdatas.sort(function(a, b) {
      if (a.bccoin > b.bccoin) return -1;
      if (a.bccoin < b.bccoin) return 1;
      return 0;
    });
    // 氏名はSQLのORDERで並び替える
    //   //氏名の順にソート（昇順）
    // } else if ((sort_graph = "3")) {
    //   resdatas.sort(function(a, b) {
    //     if (a.shimei < b.shimei) return -1;
    //     if (a.shimei > b.shimei) return 1;
    //     return 0;
    //   });
    //   //氏名の順にソート（降順）
    // } else {
    //   resdatas.sort(function(a, b) {
    //     if (a.shimei > b.shimei) return -1;
    //     if (a.shimei < b.shimei) return 1;
    //     return 0;
    //   });
  }

  console.log(bccoin);
  console.log(resdatas);
  console.log(shimei);
  res.json({
    status: true,
    data: resdatas,
    bccoin: bccoin,
    shimei: shimei
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
    if ((req.body.sort_graph = "3")) {
      req.body.sort_graph = "CAST(shimei_kana AS CHAR) ASC";
    } else if ((req.body.sort_graph = "4")) {
      req.body.sort_graph = "CAST(shimei_kana AS CHAR) DESC";
    }
    var sql =
      "select tsha.t_shain_pk as t_shain_pk,tsha.shimei as shimei,tsha.shimei_kana as shimei_kana,tsha.bc_account as bc_account,tsha.kengen_cd as kengen_cd" +
      "  from t_kiji_category" +
      " where delete_flg = '0'" +
      " order by :sort_graph";
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
// 以降、元からある関数
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
