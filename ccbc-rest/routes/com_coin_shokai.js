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
    //社員マスタから社員の基本情報を取得
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
 * API : findshokai_sosa
 * 検索条件操作者用の情報取得
 */
router.post("/findshokai_sosa", (req, res) => {
  console.log("API : findshokai_sosa - start");
  findshokai_sosa(req, res);
  console.log("API : findshokai_sosa - end");
});

// ----------------------------------------------------------------------
/**
 * API : findshokai_torihiki
 * 検索条件操作者用の情報取得
 */
router.post("/findshokai_torihiki", (req, res) => {
  console.log("API : findshokai_torihiki - start");
  findshokai_torihiki(req, res);
  console.log("API : findshokai_torihiki - end");
});

// ----------------------------------------------------------------------
/**
 * API : findshokai
 * コイン照会の一覧に表示する情報を取得
 */
router.post("findshokai", (req, res) => {
  console.log("API : findshokai - start");
  findshokai(req, res);
  console.log("API : findshokai - end");
});

// ----------------------------------------------------------------------
/**
 * 初期表示データ取得用関数（操作者取得）
 * @req {*} req
 * @res {*} res
 */
async function findshokai_sosa(req, res) {
  var ressosadatas = [];
  ressosadatas = await getshainList(req);
  console.log(ressosadatas);
  res.json({
    status: true,
    sosadata: ressosadatas
  });
}

// ----------------------------------------------------------------------
/**
 * 初期表示データ取得用関数（取引相手取得）
 * @req {*} req
 * @res {*} res
 */
async function findshokai_torihiki(req, res) {
  var restorihikidatas = [];
  restorihikidatas = await getshainList(req);
  console.log(restorihikidatas);
  res.json({
    status: true,
    torihikidata: restorihikidatas
  });
}

// ----------------------------------------------------------------------
/**
 * データ取得用関数（コイン照会の一覧情報取得）
 * 照会一覧は社員リストを基とする必要なし
 * @req {*} req
 * @res {*} res
 */
async function findshokai(req, res) {
  var resbccoin = [];
  //贈与テーブルより、取引情報取得（使用コイン、受領コイン共通）
  resbccoin = await getshokaiList(db, req);

  // 贈与テーブルの情報（resbccoin）の情報をループさせながら紐づける
  for (let i in resbccoin) {
    param = {
      transaction: resbccoin[i].transaction_id
    };
    // コイン情報を取得して配列にセットする
    shokaicoin = await bctransactionsget(param);
    resbccoin[i].shokaicoin = shokaicoin;
    shokaicoin = 0;
  }

  console.log(resbccoin);
  res.json({
    status: true,
    data: resbccoin
  });
}

// ----------------------------------------------------------------------
/**
 * 社員情報の取得（初期表示：操作者、取引相手　共通）
 * @req {*} req
 */
function getshainList(req) {
  return new Promise((resolve, reject) => {
    // SQLとパラメータを指定
    // グラフの使用コインの情報取得用
    var sql =
      "select" +
      "tsha.t_shain_pk" +
      ", tsha.shimei" +
      ", tsha.shimei_kana" +
      "from" +
      "t_shain tsha" +
      "where tsha.delete_flg = '0'" +
      "and tsha.t_shain_pk <> '1'" +
      " order by :sort_graph";
    db
      .query(sql, {
        replacements: { shain_pk: req.body.login_shain_pk },
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
 * 一覧表示用の情報取得
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
function getshokaiList(db, req) {
  return new Promise((resolve, reject) => {
    // SQLとパラメータを指定（ソートは紐づける基のとなる社員リスト側で行う）
    // イベントの検索条件を設定（0：すべて 1:HARVEST（nenji=0） 2:チャット（nenji=3） 3:記事投稿（nenji=2））
    if ((req.body.comevent = "0")) {
      req.body.comevent = "and tzoyo.nenji_flg is not null;";
    } else if ((req.body.comevent = "1")) {
      req.body.comevent = "and tzoyo.nenji_flg = '0'";
    } else if ((req.body.comevent = "2")) {
      req.body.comevent = "and tzoyo.nenji_flg = '3'";
    } else if ((req.body.comevent = "3")) {
      req.body.comevent = "and tzoyo.nenji_flg = '2'";
    }

    // 取引（0:もらった 1:あげる 2:両方）の検索条件より対象者の条件を設定
    if ((req.body.tradeinfo = "0")) {
      req.body.sosaid = sosaid;
      req.body.torihikiid = torihikiid;
    } else if ((req.body.tradeinfo = "1")) {
      req.body.sosaid = torihikiid;
      req.body.torihikiid = sosaid;
    } else if ((req.body.tradeinfo = "2")) {
      req.body.sosaid = sosaid;
      req.body.torihikiid = torihikiid;
      req.body.sosaid2 = torihikiid;
    }

    var sql =
      "select" +
      "tzoyo.zoyo_moto_shain_pk" +
      ", tsha1.shimei AS shimei_saki" +
      ", tsha1.shimei_kana AS shimei_kana_saki" +
      ", tzoyo.zoyo_saki_shain_pk" +
      ", tsha2.shimei AS shimei_moto" +
      ", tsha2.shimei_kana AS shimei_kana_moto" +
      ", tzoyo.zoyo_comment AS event" +
      ", tzoyo.transaction_id AS transaction_idelect" +
      ", tsha1.t_shain_pk as t_shain_pk" +
      ", tsha1.shimei as shimei" +
      ", tsha1.shimei_kana as shimei_kana" +
      ", tsha1.bc_account as bc_account" +
      ", tsha1.kengen_cd as kengen_cd" +
      "from t_zoyo tzoyo" +
      "left join t_shain tsha1" +
      "on tsha1.t_shain_pk = tzoyo.zoyo_moto_shain_pk" +
      "left join t_shain tsha2" +
      "on tsha2.t_shain_pk = tzoyo.zoyo_saki_shain_pk" +
      "where tzoyo.delete_flg = '0'" +
      ":sosaid" +
      ":torihikiid" +
      "and to_char(tzoyo.insert_tm,'yyyymm') >= :startmonth" +
      "and to_char(tzoyo.insert_tm,'yyyymm') <= :endmonth" +
      ":comevent";
    db
      .query(sql, {
        replacements: {
          sosaid: req.body.sosaid,
          sosaid2: req.body.sosaid2,
          torihikiid: req.body.torihikiid,
          startdate: req.body.startdate,
          enddate: req.body.enddate,
          comevent: req.body.comevent,
          tradeinfo: req.body.tradeinfo
        },
        type: db.QueryTypes.RAW
      })
      .spread((datas, metadata) => {
        console.log("DBAccess : getshokaiList result...");
        console.log(datas);
        return resolve(datas);
      });
  });
}

// // ----------------------------------------------------------------------
// /**
//  * 取引情報取得用関数(コインを受領している社員）
//  * @req {*} req
//  */
// function ccCoinGetUserget(req) {
//   return new Promise((resolve, reject) => {
//     // SQLとパラメータを指定
//     // グラフの受領コインの情報取得用
//     var sql =
//       "select" +
//       "tsha.t_shain_pk" +
//       ", tsha.shimei" +
//       ", tsha.shimei_kana" +
//       "from" +
//       "t_shain tsha" +
//       "where tsha.delete_flg = '0'" +
//       "and tsha.t_shain_pk <> '1'" +
//       " order by :sort_graph";
//     db
//       .query(sql, {
//         replacements: { shain_pk: req.body.login_shain_pk },
//         type: db.QueryTypes.RAW
//       })
//       .spread((datas, metadata) => {
//         console.log("★★★");
//         console.log(datas);
//         return resolve(datas);
//       });
//   });
// }

// ----------------------------------------------------------------------
/**
 * 年度情報取得用関数（コイン照会より流用）
 * @req {*} req
 */
function findNendo(req) {
  return new Promise((resolve, reject) => {
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    var sql =
      "select to_char(tzo.insert_tm,'yyyyMM') as year" +
      " from t_zoyo tzo" +
      " where tzo.delete_flg = '0'" +
      " group by to_char(tzo.insert_tm,'yyyyMM') order by year desc";
    db
      .query(sql, {
        type: db.QueryTypes.RAW
      })
      .spread((datas, metadata) => {
        var y = [];
        for (var i in datas) {
          y.push(getNendo(datas[i].year + "01"));
        }
        var res = y.filter(function(x, i, self) {
          return self.indexOf(x) === i;
        });
        return resolve(res);
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
      .post(bcdomain + "/bc-api/get_transactions")
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
