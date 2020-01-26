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
router.post('/findshokai_sosa', (req, res) => {
  console.log('API : findshokai_sosa - start')
  findshokai_sosa(req, res)
  console.log('API : findshokai_sosa - end')
})

// ----------------------------------------------------------------------
/**
 * API : findshokai_torihiki
 * 検索条件操作者用の情報取得
 */
router.post('/findshokai_torihiki', (req, res) => {
  console.log('API : findshokai_torihiki - start')
  findshokai_torihiki(req, res)
  console.log('API : findshokai_torihiki - end')
})

// ----------------------------------------------------------------------
/**
 * API : findshokai_event
 * 検索条件イベント用の情報取得
 */
router.post('/findshokai_event', (req, res) => {
  console.log('API : findshokai_event - start')
  findshokai_event(req, res)
  console.log('API : findshokai_event - end')
})

// ----------------------------------------------------------------------
/**
 * 初期表示データ取得用関数（操作者取得）
 * @req {*} req
 * @res {*} res
 */
async function findshokai_sosa(req, res) {
  var resdatas = [];
  var sosa = null;
  resdatas = await ccCoinSendUserget(req);
  sosa = resdatas[0].sosa
  console.log(resdatas);
  console.log(sosa);
  res.json({
    status: true,
    data: resdatas,
    sosa: sosa
  });
}

// ----------------------------------------------------------------------
/**
 * 初期表示データ取得用関数（取引相手取得）
 * @req {*} req
 * @res {*} res
 */
async function findshokai_torihiki(req, res) {
  var resdatas = [];
  var torihiki = null;
  resdatas = await ccCoinGetUserget(req);
  torihiki = resdatas[0].torihiki
  console.log(resdatas);
  console.log(torihiki);
  res.json({
    status: true,
    data: resdatas,
    torihiki: torihiki
  });
}

// ----------------------------------------------------------------------
/**
 * 初期表示データ取得用関数（イベント取得）
 * @req {*} req
 * @res {*} res
 */
async function findshokai_event(req, res) {
  var resdatas = [];
  var event = null;
  resdatas = await ccCoinEventget(req);
  event = resdatas[0].event
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
 * 取引情報取得用関数(コインを使用している社員）
 * @req {*} req
 */
function ccCoinSendUserget(req) {
  return new Promise((resolve, reject) => {
    // SQLとパラメータを指定
    // グラフの使用コインの情報取得用
    var sql =
      "select distinct(from_shain_pk)" +
      "  from t_zoyo tzoyo" +
      " where delete_flg = '0'" +
      "left join t_shain tsha1 on tsha1.t_shain_pk = tzoyo.zoyo_moto_shain_pk" +
      "left join t_shain tsha2 on tsha2.t_shain_pk = tzoyo.zoyo_saki_shain_pk" +
      " order by from_shain_pk";
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
 * 取引情報取得用関数(コインを受領している社員）
 * @req {*} req
 */
function ccCoinGetUserget(req) {
  return new Promise((resolve, reject) => {
    // SQLとパラメータを指定
    // グラフの受領コインの情報取得用
    var sql =
      "select distinct(to_shain_pk)" +
      "  from t_coin_ido" +
      " where delete_flg = '0'" +
      " order by to_shain_pk";
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
 * 取引情報取得用関数(イベント）
 * @req {*} req
 */
function ccCoinEventget(req) {
  return new Promise((resolve, reject) => {
    // SQLとパラメータを指定
    // 検索のリストボックス用に発生しているイベントの情報を取得
    var sql =
    "select distinct(zoyo_comment)" +
    "  from t_zoyo" +
    " where delete_flg = '0'" +
    " order by zoyo_comment";
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
