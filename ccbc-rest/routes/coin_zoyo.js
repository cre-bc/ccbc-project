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
    bc_addr: req.body.bc_addr,
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
    from_bcaccount: resdatas[0].from_bc_account,
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
    db.query(sql, {
      replacements: { mypk: req.body.tShainPk },
      type: db.QueryTypes.RAW,
    }).spread((datas, metadata) => {
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
  db.query(sql, {
    replacements: { mytoken: req.body.tokenId },
    type: db.QueryTypes.RAW,
  }).spread(async (datas, metadata) => {
    console.log(datas);
    if (datas.length == 0) {
      console.log("トークンチェックエラー");
      res.json({ status: false });
      return;
    }
  });

  db.transaction(async function (tx) {
    var resdatas = [];
    await tZoyoInsert(tx, resdatas, req);
    var transaction_id = await bcrequest(req);
    await dbupdate(tx, transaction_id, req);
    res.json({ status: true, data: resdatas });
  })
    .then((result) => {
      // コミットしたらこっち
      console.log("正常");
    })
    .catch((e) => {
      // ロールバックしたらこっち
      console.log("異常");
      console.log(e);
    });
});

/**
 * t_zoyoテーブルのinsert用関数
 * @param {*} tx
 * @param {*} resdatas
 * @param {*} req
 */
function tZoyoInsert(tx, resdatas, req) {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into t_zoyo (zoyo_moto_shain_pk, zoyo_saki_shain_pk, zoyo_comment, nenji_flg, delete_flg, insert_user_id, insert_tm) " +
      "VALUES (?, ?, ?, ?, ?, ?, current_timestamp) ";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db.query(sql, {
      transaction: tx,
      replacements: [
        req.body.tShainPk,
        req.body.to_tShainPk,
        req.body.comment,
        "1",
        "0",
        req.body.userid,
      ],
    }).spread((datas, metadata) => {
      console.log("◆6");
      console.log(datas);
      resdatas.push(datas);
      return resolve(datas);
    });
  });
}
/**
 * BCコイン送金用関数
 * @param {*} req
 */
function bcrequest(req) {
  return new Promise((resolve, reject) => {
    var param = {
      from_account: [req.body.from_bcaccount],
      to_account: [req.body.to_bcaccount],
      password: [req.body.password],
      coin: [req.body.zoyoCoin],
      bc_addr: req.body.bc_addr,
    };
    console.log("★★★");
    request
      .post(bcdomain + "/bc-api/send_coin")
      .send(param)
      .end((err, res) => {
        console.log("★★★");
        if (err) {
          console.log("★" + err);
          return;
        }
        // 検索結果表示
        console.log("★★★" + res.body.transaction);
        return resolve(res.body.transaction[0]);
      });
  });
}

/**
 * t_zoyoテーブルのupdate用関数
 * @param {*} tx
 * @param {*} transaction_id
 */
function dbupdate(tx, transaction_id, req) {
  return new Promise((resolve, reject) => {
    var sql =
      "update t_zoyo set transaction_id = ? where transaction_id is null";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db.query(sql, {
      transaction: tx,
      replacements: [transaction_id],
    }).spread((datas, metadata) => {
      console.log(datas);
      return resolve(datas);
    });
  });
}

module.exports = router;
