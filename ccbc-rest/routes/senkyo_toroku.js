const request = require("superagent");
const express = require("express");
const router = express.Router();
const async = require("async");
const db = require("./common/sequelize_helper.js").sequelize;
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
  resdatas = await tShainGet(req);
  param = {
    account: resdatas[0].from_bc_account,
    bc_addr: req.body.bc_addr,
  };
  bccoin = await bccoinget(param);
  console.log(bccoin);
  console.log(resdatas);
  res.json({ status: true, data: resdatas, bccoin: bccoin });
}
/**
 * 社員取得用関数
 * @req {*} req
 */
function tShainGet(req) {
  return new Promise((resolve, reject) => {
    var sql =
      "select row_number() over () as id, *, tsha.t_shain_pk as t_shain_pk, tsha.shimei as shimei, tsha.image_file_nm as image_file_nm, tsha.bc_account as bc_account, null as title, tsha.kengen_cd as kengen_cd, tsha2.bc_account as from_bc_account" +
      " from t_shain tsha, t_shain tsha2 " +
      " where tsha.delete_flg = '0' and tsha2.delete_flg = '0' and tsha2.t_shain_pk = :mypk and tsha.kengen_cd <> '0' ";
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

router.post("/findShokai", (req, res) => {
  findShokaidata(req, res);
  console.log("end");
});

/**
 * 初期表示データ取得用関数(照会用)
 * @req {*} req
 * @res {*} res
 */
async function findShokaidata(req, res) {
  var resdatas = [];
  var resdatas2 = [];
  resdatas = await tShainShokaiGet(req);
  resdatas2 = await tSenkyoGet(req);
  console.log(resdatas);
  console.log(resdatas2);
  res.json({ status: true, data: resdatas, senkyoData: resdatas2 });
}

/**
 * 社員取得用関数（照会）
 * @req {*} req
 */
function tShainShokaiGet(req) {
  return new Promise((resolve, reject) => {
    var sql =
      "select row_number() over () as id, tsha.t_shain_pk as t_shain_pk, tsha.shimei as shimei, tsha.image_file_nm as image_file_nm, tpre.title as happyotitle, tsha.kengen_cd as kengen_cd, tshu.t_shussekisha_pk as t_shussekisha_pk, tpre.t_presenter_pk as t_presenter_pk" +
      " from t_shain tsha" +
      " left join t_shussekisha tshu on tsha.t_shain_pk = tshu.t_shain_pk and tshu.delete_flg = '0' and tshu.t_senkyo_pk = :senkyoPk" +
      " left join t_presenter tpre on tsha.t_shain_pk = tpre.t_shain_pk and tshu.t_senkyo_pk = tpre.t_senkyo_pk and tpre.delete_flg = '0'" +
      " where tsha.delete_flg = '0' and tsha.kengen_cd <> '0'";
    db.query(sql, {
      replacements: { senkyoPk: req.body.tSenkyoPk },
      type: db.QueryTypes.RAW,
    }).spread((datas, metadata) => {
      console.log("★★★");
      console.log(datas);
      return resolve(datas);
    });
  });
}

/**
 * 選挙取得用関数
 * @req {*} req
 */
function tSenkyoGet(req) {
  return new Promise((resolve, reject) => {
    var sql =
      "select tsen.senkyo_nm as senkyo_nm, tsen.tohyo_kaishi_dt as tohyo_kaishi_dt, tsen.tohyo_shuryo_dt as tohyo_shuryo_dt, tsen.haifu_coin as haifu_coin, tsen.config_coin as config_coin" +
      " from t_senkyo tsen" +
      " where tsen.t_senkyo_pk = :senkyoPk and tsen.delete_flg = '0'";
    db.query(sql, {
      replacements: { senkyoPk: req.body.tSenkyoPk },
      type: db.QueryTypes.RAW,
    }).spread((datas, metadata) => {
      console.log("★★★");
      console.log(datas);
      return resolve(datas);
    });
  });
}

router.post("/create", (req, res) => {
  console.log("◆◆◆");
  var resultList = req.body.resultList;
  var selected = req.body.selected;
  var selected2 = req.body.selected2;

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
      console.log("★★★★★トークンチェックエラー");
      res.json({ status: false });
      return;
    }
  });

  db.transaction(async function (tx) {
    var resdatas = [];
    var t_senkyo_pk = await tSenkyoInsert(tx, resdatas, req);
    var selected = req.body.selected;
    console.log(t_senkyo_pk);
    for (var i in resultList) {
      var resultdata = resultList[i];
      console.log(resultdata);
      for (var x in selected) {
        if (resultdata.id == selected[x]) {
          var t_shussekisha_pk = await tShussekishaInsert(
            tx,
            resdatas,
            req,
            t_senkyo_pk,
            resultdata
          );
          // 投票のコインの流れを修正（旧：事務局→出席者→発表者、新：事務局→発表者）
          // ※選挙登録時の事務局→出席者のコイン異動は行わない
          // await tZoyoInsert(tx, resdatas, req, resultdata)
          // var transaction_id = await bcrequest(req, resultdata, i)
          // await dbupdate(tx, transaction_id)
        }
      }
      for (var x in selected2) {
        if (resultdata.id == selected2[x]) {
          await tPresenterInsert(tx, resdatas, req, t_senkyo_pk, resultdata, i);
        }
      }
    }
    res.json({ status: true, data: resdatas });

    // このあとにawait sequelizeXXXXを記載することで連続して処理をかける
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
 * t_senkyoテーブルのinsert用関数
 * @param {*} tx
 * @param {*} resdatas
 * @param {*} req
 */
function tSenkyoInsert(tx, resdatas, req) {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into t_senkyo (senkyo_nm, tohyo_kaishi_dt, tohyo_shuryo_dt, haifu_coin, config_coin, delete_flg, insert_user_id, insert_tm) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?, current_timestamp) RETURNING t_senkyo_pk";

    db.query(sql, {
      transaction: tx,
      replacements: [
        req.body.election,
        req.body.startDate,
        req.body.endDate,
        req.body.coin,
        req.body.configCoin,
        "0",
        req.body.userid,
      ],
    }).spread((datas, metadata) => {
      console.log("◆３");
      console.log(datas);
      resdatas.push(datas);
      return resolve(datas[0].t_senkyo_pk);
    });
  });
}

/**
 * t_shussekishaテーブルのinsert用関数
 * @param {*} tx
 * @param {*} resdatas
 * @param {*} req
 * @param {*} t_senkyo_pk
 * @param {*} resultdata
 */
function tShussekishaInsert(tx, resdatas, req, t_senkyo_pk, resultdata) {
  return new Promise((resolve, reject) => {
    console.log("◆4");
    console.log(resultdata);
    var sql2 =
      "insert into t_shussekisha (t_senkyo_pk, t_shain_pk, delete_flg, insert_user_id, insert_tm) " +
      "VALUES (?, ?, ?, ?, current_timestamp) RETURNING t_shussekisha_pk";
    db.query(sql2, {
      transaction: tx,
      replacements: [t_senkyo_pk, resultdata.t_shain_pk, "0", req.body.userid],
    }).spread((datas, metadata) => {
      console.log("◆5");
      console.log(datas);
      resdatas.push(datas);
      return resolve(datas[0].t_shussekisha_pk);
    });
  });
}

/**
 * t_zoyoテーブルのinsert用関数
 * @param {*} tx
 * @param {*} resdatas
 * @param {*} req
 * @param {*} t_senkyo_pk
 * @param {*} resultdata
 */
function tZoyoInsert(tx, resdatas, req, resultdata) {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into t_zoyo (zoyo_moto_shain_pk, zoyo_saki_shain_pk, zoyo_comment, delete_flg, insert_user_id, insert_tm) " +
      "VALUES (?, ?, ?, ?, ?, current_timestamp) ";

    db.query(sql, {
      transaction: tx,
      replacements: [
        req.body.tShainPk,
        resultdata.t_shain_pk,
        req.body.election,
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
 * @param {*} resultdata
 * @param {*} i
 */
function bcrequest(req, resultdata, i) {
  return new Promise((resolve, reject) => {
    var haifuCoin = 0;
    for (var x in req.body.haifuCoinList) {
      var haifuCoinData = req.body.haifuCoinList[x];
      if (resultdata.t_shain_pk === haifuCoinData.tShainPk) {
        haifuCoin = haifuCoinData.haifuCoin;
        console.log("▲▲▲▲▲▲▲▲▲▲▲▲▲");
        console.log("社員PK：" + haifuCoinData.tShainPk);
        console.log("配布コイン：" + haifuCoin);
        break;
      }
    }

    var param = {
      from_account: [resultdata.from_bc_account],
      to_account: [resultdata.bc_account],
      password: [req.body.password],
      coin: [haifuCoin],
      bc_addr: req.body.bc_addr,
    };
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
 * t_presenterテーブルのinsert用関数
 * @param {*} tx
 * @param {*} resdatas
 * @param {*} req
 * @param {*} t_senkyo_pk
 * @param {*} resultdata
 */
function tPresenterInsert(tx, resdatas, req, t_senkyo_pk, resultdata, i) {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into t_presenter (t_senkyo_pk, t_shain_pk, title, delete_flg, insert_user_id, insert_tm) " +
      "VALUES (?, ?, ?, ?, ?, current_timestamp) ";

    db.query(sql, {
      transaction: tx,
      replacements: [
        t_senkyo_pk,
        resultdata.t_shain_pk,
        req.body.happyotitle[i],
        "0",
        req.body.userid,
      ],
    }).spread((datas, metadata) => {
      console.log("◆7");
      console.log(datas);
      resdatas.push(datas);
      return resolve(datas);
    });
  });
}

/**
 * t_zoyoテーブルのupdate用関数
 * @param {*} tx
 * @param {*} transaction_id
 */
function dbupdate(tx, transaction_id) {
  return new Promise((resolve, reject) => {
    var sql2 =
      "update t_zoyo set transaction_id = ? where transaction_id is null";
    db.query(sql2, {
      transaction: tx,
      replacements: [transaction_id],
    }).spread((datas, metadata) => {
      console.log(datas);
      return resolve(datas);
    });
  });
}

module.exports = router;
