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
 * データ取得用関数（グラフ情報取得）
 * グラフの要素は、社員と受領コインと使用コイン
 * 使用したコインと受領したコインの情報は、社員リストに紐づけてそれぞれ取得する
 * @req {*} req
 * @res {*} res
 */
async function findshokaigraph(req, res) {
  var resdatas = [];
  var resbccoin = [];

  //社員リストの情報取得
  resdatas = await getgraphshainList(req);
  //贈与テーブルより、取引情報取得（使用コイン、受領コイン共通）
  resbccoin = await getgraphcoinList(req);

  // 使用コイン（motocoin）と受領コイン（sakicoin）はgetgraphcoinList（使用コインと受領コインのリスト）をgetgraphshainList（社員リスト）に紐づける

  // 社員が一意のリスト（resdata）をループ
  for (let i in resdatas) {
    // 贈与テーブルの情報（resbccoin）の情報をループさせながら紐づける
    for (let n in resbccoin) {
      // 使用元の社員を紐づけて、使用コインを取得
      if (resdatas[i].t_shain_pk === resbccoin[n].zoyo_moto_shain_pk) {
        param = {
          transaction: resbccoin[n].transaction_id
        };
        // 使用コインを取得して、合計する
        motocoin = await bctransactionsget(param);
        motocoin_sum += motocoin;
      }

      // 受領先の社員を紐づけて、使用コインを取得
      if (resdatas[i].t_shain_pk === resbccoin[n].zoyo_saki_shain_pk) {
        param = {
          transaction: resbccoin[n].transaction_id
        }; // 受領コインを取得して、合計する
        sakicoin = await bctransactionsget(param);
        sakicoin_sum += sakicoin;
      }
    }
    // 社員に紐づく使用コインの合計をセット
    resdatas[i].motocoin = motocoin_sum;
    motocoin_sum = 0;
    // 社員に紐づく受領コインの合計をセット
    resdatas[i].sakicoin = sakicoin_sum;
    sakicoin_sum = 0;
  }
  // この時点で、社員リストを基としたresdataには、社員に紐づく使用コイン計（motocoin）と受領コイン計（sakicoin）が紐づいている

  //リストボックスでコインのソートが選ばれている場合、並び替え
  if ((request.body.sort_graph = "1")) {
    //使用コインの順にソート（昇順）
    resdatas.sort(function(a, b) {
      if (a.motocoin < b.motocoin) return -1;
      if (a.motocoin > b.motocoin) return 1;
      return 0;
    });
  } else if ((request.body.sort_graph = "2")) {
    //使用コインの順にソート（降順）
    resdatas.sort(function(a, b) {
      if (a.motocoin > b.motocoin) return -1;
      if (a.motocoin < b.motocoin) return 1;
      return 0;
    });
  } else if ((request.body.sort_graph = "3")) {
    //受領コインの順にソート（昇順）
    resdatas.sort(function(a, b) {
      if (a.sakicoin < b.sakicoin) return -1;
      if (a.sakicoin > b.sakicoin) return 1;
      return 0;
    });
  } else if ((request.body.sort_graph = "4")) {
    //受領コインの順にソート（降順）
    resdatas.sort(function(a, b) {
      if (a.sakicoin > b.sakicoin) return -1;
      if (a.sakicoin < b.sakicoin) return 1;
      return 0;
    });
  }

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
function getgraphshainList(db, req) {
  return new Promise((resolve, reject) => {
    // SQLとパラメータを指定
    // ソート順を設定
    if ((req.body.sort_graph = "5")) {
      req.body.sort_graph = "CAST(tsha.shimei_kana AS CHAR) ASC";
    } else if ((req.body.sort_graph = "6")) {
      req.body.sort_graph = "CAST(tsha.shimei_kana AS CHAR) DESC";
    }
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
/**
 * テーブルよりselect（DBアクセス）
 * グラフ表示用の情報取得（使用者（元）、受領者（先）両方の情報を取得し使い分ける）
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
function getgraphcoinList(db, req) {
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
      "and to_char(tzoyo.insert_tm,'yyyymm') >= :startmonth" +
      "and to_char(tzoyo.insert_tm,'yyyymm') <= :endmonth" +
      ":comevent";
    db
      .query(sql, {
        replacements: {
          startmonth: req.body.startmonth,
          endmonth: req.body.endmonth,
          comevent: req.body.comevent
        },
        type: db.QueryTypes.RAW
      })
      .spread((datas, metadata) => {
        console.log("DBAccess : getgraphcoinList result...");
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
