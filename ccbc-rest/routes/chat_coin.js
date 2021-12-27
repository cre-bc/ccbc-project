const request = require("superagent");
const express = require("express");
const router = express.Router();
const async = require("async");
var db = require("./common/sequelize_helper.js").sequelize;
var db2 = require("./common/sequelize_helper.js");
const bcdomain = require("./common/constans.js").bcdomain;
var mainte = require("./common/maintenance_helper.js");

/**
 * チャットコイン_初期表示
 */
router.post("/find", async (req, res) => {
  var mntRes = await mainte.checkAppStatus(req)
  if (mntRes != null) {
    res.json(mntRes);
    return;
  }

  findData(req, res);
});

/**
 * チャットコイン_DB登録
 */
router.post("/create", async (req, res) => {
  var mntRes = await mainte.checkAppStatus(req)
  if (mntRes != null) {
    res.json(mntRes);
    return;
  }

  coinSend(req, res);
});

/**
 * 贈与情報を登録し、BCのコインを移動
 * @param req リクエスト
 * @param res レスポンス
 */
async function coinSend(req, res) {
  // BCコイン数を取得
  const param = {
    account: req.body.bcAccount,
    bc_addr: req.body.bc_addr,
  };

  bccoin = await bccoinget(param);

  var sofuCoin = req.body.sofuCoin;
  // 合計コイン数が利用可能コイン数を上回る場合、NG
  if (sofuCoin > bccoin) {
    console.log(
      "コイン不足：totalCoin：" + sofuCoin + " availableCoin：" + bccoin
    );
    res.json({ status: false, bccoin: bccoin });
    return;
  }

  if (req.body.db_name != null && req.body.db_name != "") {
    db = db2.sequelize3(req.body.db_name);
  } else {
    db = require("./common/sequelize_helper.js").sequelize;
  }
  db.transaction(async function (tx) {
    // チャットテーブルinsert
    var t_chat_pk = await insertChat(tx, req);
    var bc_account = await toBcAccountGet(req);
    var transaction_id = await bcrequest(req, bc_account[0].bc_account);

    // 贈与テーブルの追加
    var ret = await insertZoyo(tx, req, transaction_id);
    const zoyoPk = ret[0].t_zoyo_pk;

    // チャットテーブルの更新
    await updateChatAfterZoyo(tx, req, t_chat_pk, zoyoPk);

    // await tCoinIdoUpdate(tx, transaction_id, req, t_coin_ido_pk);
    res.json({ status: true, t_chat_pk: t_chat_pk });
  })
    .then((result) => {
      // プッシュ通知
      if (
        req.body.fromExpoPushToken !== "" &&
        req.body.fromExpoPushToken !== null
      ) {
        const pushData = [
          {
            to: req.body.fromExpoPushToken,
            title: req.body.shimei,
            body: req.body.comment,
            sound: "default",
            badge: 1,
            data: {
              title: req.body.shimei,
              message: req.body.comment,
              fromShainPk: req.body.loginShainPk,
              fromShimei: req.body.shimei,
              fromImageFileNm: req.body.imageFileName,
              fromExpoPushToken: req.body.expo_push_token,
            },
          },
        ];
        request
          .post("https://exp.host/--/api/v2/push/send")
          .send(pushData)
          .end((err, res) => {
            if (err) {
              console.log("chat_coin:", "Push send error:", err);
              console.log("chat_coin:", "Push send data:", pushData);
            }
          });
      }
    })
    .catch((e) => {
      // ロールバックしたらこっち
      console.log("異常");
      console.log(e);
    });
}

/**
 * データ取得用関数
 *
 * @param {*} req
 * @param {*} res
 */
async function findData(req, res) {
  db = db2.sequelizeDB(req);
  var resdatas = [];
  var mdatas = [];
  var bccoin = 0;

  // 承認マスタの取得
  mdatas = await selectShonin(db, req);

  // BCアカウントを取得
  resdatas = await bcAccountGet(req);
  param = {
    account: resdatas[0].bc_account,
    bc_addr: req.body.bc_addr,
  };

  // BCコイン数を取得
  bccoin = await bccoinget(param);
  res.json({
    status: true,
    data: resdatas,
    bccoin: bccoin,
    from_bcaccount: resdatas[0].from_bc_account,
    shoninList: mdatas,
  });
}

/**
 * 承認マスタを取得（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
function selectShonin(db, req) {
  return new Promise((resolve, reject) => {
    var sql =
      "select shonin_cd, shonin_point from m_shonin where delete_flg = '0' order by m_shonin_pk";
    db.query(sql, {
      type: db.QueryTypes.RAW,
    }).spread((datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * BCアカウント取得用関数
 *
 * @param {*} req
 */
async function bcAccountGet(req) {
  return new Promise((resolve, reject) => {
    var sql =
      "select tsha.bc_account as bc_account" +
      " from t_shain tsha" +
      " where tsha.delete_flg = '0' and tsha.t_shain_pk = :myPk";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db.query(sql, {
      replacements: {
        myPk: req.body.loginShainPk,
      },
      type: db.QueryTypes.RAW,
    }).spread(async (datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * 相手のBCアカウント取得用関数
 *
 * @param {*} req
 */
async function toBcAccountGet(req) {
  return new Promise((resolve, reject) => {
    var sql =
      "select tsha.bc_account as bc_account" +
      " from t_shain tsha" +
      " where tsha.delete_flg = '0' and tsha.t_shain_pk = :myPk";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db.query(sql, {
      replacements: {
        myPk: req.body.fromShainPk,
      },
      type: db.QueryTypes.RAW,
    }).spread(async (datas, metadata) => {
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
        return resolve(res.body.coin);
      });
  });
}

/**
 * t_chatテーブルのinsert用関数
 * @param {*} tx
 * @param {*} req
 */
function insertChat(tx, req) {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into t_chat (from_shain_pk, to_shain_pk, comment, post_dt, post_tm, t_coin_ido_pk, delete_flg, insert_user_id, insert_tm, update_user_id, update_tm, shonin_cd, t_chat_group_pk) " +
      "VALUES (?, ?, pgp_sym_encrypt(?, 'comcomcoin_chat'), current_timestamp, current_timestamp, ?, ?, ?, current_timestamp, ?, ?, ?, ?) RETURNING t_chat_pk";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }

    db.query(sql, {
      transaction: tx,
      replacements: [
        req.body.loginShainPk,
        req.body.fromShainPk,
        req.body.comment,
        0,
        0,
        req.body.userid,
        null,
        null,
        req.body.shoninCd,
        0,
      ],
    }).spread((datas, metadata) => {
      return resolve(datas[0].t_chat_pk);
    });
  });
}

/**
 * 贈与情報（t_zoyo）テーブルのinsert
 * @param tx トランザクション
 * @param req リクエスト
 * @param transactionId BC登録時のトランザクションID
 */
function insertZoyo(tx, req, transactionId) {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into t_zoyo (zoyo_moto_shain_pk, zoyo_saki_shain_pk, transaction_id, zoyo_comment, nenji_flg, delete_flg, insert_user_id, insert_tm) " +
      " values (:zoyo_moto_shain_pk, :zoyo_saki_shain_pk, :transaction_id, :zoyo_comment, :nenji_flg, '0', :insert_user_id, current_timestamp) " +
      " returning t_zoyo_pk";

    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db.query(sql, {
      transaction: tx,
      replacements: {
        zoyo_moto_shain_pk: req.body.loginShainPk,
        zoyo_saki_shain_pk: req.body.fromShainPk,
        transaction_id: transactionId,
        zoyo_comment: req.body.zoyoComment,
        nenji_flg: "3",
        insert_user_id: req.body.userid,
      },
    }).spread((datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * t_chatテーブルのupdate用関数
 * @param {*} tx
 * @param {*} req
 * @param {*} t_chat_pk
 * @param {*} zoyoPk
 */
function updateChatAfterZoyo(tx, req, t_chat_pk, zoyoPk) {
  return new Promise((resolve, reject) => {
    var sql = "update t_chat set t_coin_ido_pk = ? " + "where t_chat_pk = ?";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }

    db.query(sql, {
      transaction: tx,
      replacements: [zoyoPk, t_chat_pk],
    }).spread((datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * BCコイン送金用関数
 * @param {*} req
 */
function bcrequest(req, bc_account) {
  return new Promise((resolve, reject) => {
    var param = {
      from_account: [req.body.bcAccount],
      to_account: [bc_account],
      password: [req.body.password],
      coin: [req.body.sofuCoin],
      bc_addr: req.body.bc_addr,
    };
    request
      .post(bcdomain + "/bc-api/send_coin")
      .send(param)
      .end((err, res) => {
        if (err) {
          console.log("★" + err);
          return;
        }
        // 検索結果表示
        // console.log("★★★" + res.body.transaction);
        return resolve(res.body.transaction[0]);
      });
  });
}

module.exports = router;
