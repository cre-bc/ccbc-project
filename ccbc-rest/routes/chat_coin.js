const request = require("superagent");
const express = require("express");
const router = express.Router();
const async = require("async");
var db = require("./common/sequelize_helper.js").sequelize;
var db2 = require("./common/sequelize_helper.js");
const bcdomain = require("./common/constans.js").bcdomain;

/**
 * チャットコイン_初期表示
 */
router.post("/find", (req, res) => {
  console.log(req.params);
  findData(req, res);
});

/**
 * チャットコイン_DB登録
 */
router.post("/create", (req, res) => {
  // console.log("◆◆◆");
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
    bc_addr: req.body.bc_addr
  };

  bccoin = await bccoinget(param);

  // 現在の選挙情報を取得
  tSenkyo = await senkyoPkGet(req);
  // 投票期間中の出席した選挙が存在する場合
  if (tSenkyo.length != 0) {
    senkyoPk = tSenkyo[0].tsenkyopk;
    // 未投票情報の取得
    miTohyosha = await miTohohyoshaGet(req, senkyoPk);
    // 未投票の場合
    if (miTohyosha.length === 0) {
      // 投票コイン取得
      tohyoCoin = await tohyoCoinGet(req, senkyoPk);
      if (tohyoCoin.length != 0) {
        haifuCoin = tohyoCoin[0].haifu_coin;
        configCoin = tohyoCoin[0].config_coin;
        presenterPk = tohyoCoin[0].t_presenter_pk;
        countShussekisha = tohyoCoin[0].countshussekisha;
        countPresen = tohyoCoin[0].countpresen;

        // console.log(haifuCoin);
        // console.log(configCoin);
        // console.log(presenterPk);
        // console.log(countShussekisha);
        // console.log(countPresen);

        // 投票一人当たりのコイン数
        configCoin = configCoin * 50;
        // console.log(configCoin);
        // 部会での配布コイン数
        tohyoCoin = configCoin * countPresen;
        // console.log(tohyoCoin);

        //発表者の場合、1人分のコイン数を差し引く
        if (presenterPk != null) {
          tohyoCoin = tohyoCoin - configCoin;
        }
        // 現在のコインから投票用コイン数を差し引く
        bccoin = bccoin - tohyoCoin;
      }
    }
  }

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
  db
    .transaction(async function (tx) {
      // チャットテーブルinsert
      var t_chat_pk = await insertChat(tx, req);
      // console.log(req.body.fromShainPk);
      //      // チャット既読テーブル更新
      //      await updateChatKidoku(
      //        tx,
      //        req,
      //        t_chat_pk,
      //        req.body.loginShainPk,
      //        req.body.fromShainPk
      //      );

      // var t_coin_ido_pk = await tCoinIdoInsert(tx, req);
      var bc_account = await toBcAccountGet(req);
      var transaction_id = await bcrequest(req, bc_account[0].bc_account);

      // 贈与テーブルの追加
      var ret = await insertZoyo(tx, req, transaction_id);
      const zoyoPk = ret[0].t_zoyo_pk

      // チャットテーブルの更新
      await updateChatAfterZoyo(tx, req, t_chat_pk, zoyoPk)

      // await tCoinIdoUpdate(tx, transaction_id, req, t_coin_ido_pk);
      res.json({ status: true, t_chat_pk: t_chat_pk });
    })
    .then(result => {
      // プッシュ通知
      if (req.body.fromExpoPushToken !== "" && req.body.fromExpoPushToken !== null) {
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
              fromExpoPushToken: req.body.expo_push_token
            }
          }]
        request
          .post("https://exp.host/--/api/v2/push/send")
          .send(pushData)
          .end((err, res) => {
            if (err) {
              console.log("chat_coin:", "Push send error:", err)
              console.log("chat_coin:", "Push send data:", pushData)
            }
          });
      }
      // コミットしたらこっち
      console.log("正常");
    })
    .catch(e => {
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
  console.log("★findData★");
  var resdatas = [];
  var bccoin = 0;
  var tSenkyo = [];
  var miTohyosha = [];
  var tohyoCoin = [];
  var senkyoPk = 0;
  var haifuCoin = 0;
  var configCoin = 0;
  var presenterPk = 0;
  var countShussekisha = 0;
  var countPresen = 0;
  var tohyoCoin = 0;

  // BCアカウントを取得
  resdatas = await bcAccountGet(req);
  param = {
    account: resdatas[0].bc_account,
    bc_addr: req.body.bc_addr
  };

  // BCコイン数を取得
  bccoin = await bccoinget(param);
  console.log("BCコイン：" + bccoin);

  // 現在の選挙情報を取得
  tSenkyo = await senkyoPkGet(req);
  // 投票期間中の出席した選挙が存在する場合
  if (tSenkyo.length != 0) {
    senkyoPk = tSenkyo[0].tsenkyopk;
    // 未投票情報の取得
    miTohyosha = await miTohohyoshaGet(req, senkyoPk);
    // console.log(miTohyosha);
    // 未投票の場合
    if (miTohyosha.length === 0) {
      // 投票コイン取得
      tohyoCoin = await tohyoCoinGet(req, senkyoPk);
      if (tohyoCoin.length != 0) {
        haifuCoin = tohyoCoin[0].haifu_coin;
        configCoin = tohyoCoin[0].config_coin;
        presenterPk = tohyoCoin[0].t_presenter_pk;
        countShussekisha = tohyoCoin[0].countshussekisha;
        countPresen = tohyoCoin[0].countpresen;

        // console.log(haifuCoin);
        // console.log(configCoin);
        // console.log(presenterPk);
        // console.log(countShussekisha);
        // console.log(countPresen);

        // 投票一人当たりのコイン数
        configCoin = configCoin * 50;
        // console.log(configCoin);
        // 部会での配布コイン数
        tohyoCoin = configCoin * countPresen;
        // console.log(tohyoCoin);

        //発表者の場合、1人分のコイン数を差し引く
        if (presenterPk != null) {
          tohyoCoin = tohyoCoin - configCoin;
        }
        // 現在のコインから投票用コイン数を差し引く
        bccoin = bccoin - tohyoCoin;
      }
    }
  }
  console.log("最終コイン：" + bccoin);
  res.json({
    status: true,
    data: resdatas,
    bccoin: bccoin,
    from_bcaccount: resdatas[0].from_bc_account
  });
}

/**
 * 選挙取得用関数
 *
 */
async function senkyoPkGet(req) {
  return new Promise((resolve, reject) => {
    console.log("★ start senkyoPkGet★");
    // 現在、投票期間か？出席しているか？
    var sql =
      "select tsen.t_senkyo_pk as tsenkyopk" +
      " from t_senkyo tsen" +
      " inner join t_shussekisha tshu on tsen.t_senkyo_pk = tshu.t_senkyo_pk" +
      " where tsen.delete_flg = '0' and tshu.delete_flg = '0' and tshu.t_shain_pk = :myPk" +
      " and current_date between tsen.tohyo_kaishi_dt and tsen.tohyo_shuryo_dt";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db
      .query(sql, {
        replacements: {
          myPk: req.body.loginShainPk
        },
        type: db.QueryTypes.RAW
      })
      .spread(async (datas, metadata) => {
        console.log("★End senkyoPkGet★");
        return resolve(datas);
      });
  });
}

/**
 * 未投票者取得用関数
 *
 * @param {*} req
 * @param {*} tsenkyopk
 */
async function miTohohyoshaGet(req, tsenkyopk) {
  return new Promise((resolve, reject) => {
    console.log("★★★miTohohyoshaGet★★★");
    // 選挙PKは前SQL（投票期間中かどうか？）より取得する
    var sql =
      // "select count(*) from t_shain where t_shain_pk in( select t1.t_shain_pk from " +
      // "( select t1.t_senkyo_pk, t2.t_shussekisha_pk, t2.t_shain_pk, t3.t_shussekisha_pk from t_senkyo t1 inner join t_shussekisha t2 on  t1.t_senkyo_pk = t2.t_senkyo_pk left join " +
      // "( select t_shussekisha_pk from t_tohyo where delete_flg = '0' ) t3 on  t2.t_shussekisha_pk = t3.t_shussekisha_pk where t1.t_senkyo_pk = :tSenkyoPk " +
      // "and t2.t_shain_pk = :myPk and t3.t_shussekisha_pk is null and t1.delete_flg = '0' and t2.delete_flg = '0' ) t1 ) ";
      "select tto.t_tohyo_pk from t_senkyo tsen" +
      " left join t_shussekisha tsh on tsen.t_senkyo_pk = tsh.t_senkyo_pk" +
      " left join t_tohyo tto on tsh.t_shussekisha_pk = tto.t_shussekisha_pk" +
      " where tsen.delete_flg = '0' and tsh.delete_flg = '0' and tto.delete_flg = '0' and tsen.t_senkyo_pk = :tSenkyoPk and tsh.t_shain_pk = :myPk";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db
      .query(sql, {
        replacements: { tSenkyoPk: tsenkyopk, myPk: req.body.loginShainPk },
        type: db.QueryTypes.RAW
      })
      .spread(async (datas, metadata) => {
        console.log("★★★【End】miTohohyoshaGet★★★");
        return resolve(datas);
      });
  });
}

/**
 * 投票用コイン取得用関数
 *
 * @param {*} req
 * @param {*} tsenkyopk
 */
async function tohyoCoinGet(req, tsenkyopk) {
  return new Promise((resolve, reject) => {
    console.log("★★★tohyoCoinGet★★★");
    // 選挙PKは前SQL（現在投票期間中の選挙）より取得する
    // var sql =
    //   "select tsen.haifu_coin,tsen.config_coin,tpr.t_presenter_pk from t_senkyo tsen" +
    //   " left outer join (select tpr1.t_presenter_pk,tpr1.t_senkyo_pk from t_presenter tpr1 where tpr1.delete_flg = '0' and tpr1.t_shain_pk = :myPk) tpr on tsen.t_senkyo_pk = tpr.t_senkyo_pk" +
    //   " where tsen.t_senkyo_pk = :tSenkyoPk and tsen.delete_flg = '0'";
    var sql =
      "select tsen.haifu_coin,tsen.config_coin,tpr3.t_presenter_pk,countShussekisha, countPresen from t_senkyo tsen" +
      " inner join (select count(*) as countShussekisha,t_senkyo_pk from t_shussekisha tsh1 where tsh1.t_senkyo_pk = :tSenkyoPk group by t_senkyo_pk) tsh on tsen.t_senkyo_pk = tsh.t_senkyo_pk" +
      " inner join (select count(*) as countPresen,t_senkyo_pk from t_presenter tpr1 where tpr1.t_senkyo_pk = :tSenkyoPk group by t_senkyo_pk) tpr on tsen.t_senkyo_pk = tpr.t_senkyo_pk" +
      " left outer join (select tpr2.t_presenter_pk,tpr2.t_senkyo_pk from t_presenter tpr2 where tpr2.delete_flg = '0' and tpr2.t_shain_pk = :myPk) tpr3 on tsen.t_senkyo_pk = tpr3.t_senkyo_pk" +
      " where tsen.t_senkyo_pk = :tSenkyoPk and tsen.delete_flg = '0'";

    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db
      .query(sql, {
        replacements: { tSenkyoPk: tsenkyopk, myPk: req.body.loginShainPk },
        type: db.QueryTypes.RAW
      })
      .spread(async (datas, metadata) => {
        // console.log("----------");
        // console.log(datas);
        // console.log("----------");
        // console.log("★★★【End】tohyoCoinGet★★★");
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
    console.log("★ start bcAccountGet★");
    var sql =
      "select tsha.bc_account as bc_account" +
      " from t_shain tsha" +
      " where tsha.delete_flg = '0' and tsha.t_shain_pk = :myPk";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db
      .query(sql, {
        replacements: {
          myPk: req.body.loginShainPk
        },
        type: db.QueryTypes.RAW
      })
      .spread(async (datas, metadata) => {
        console.log("★End bcAccountGet");
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
    console.log("★ start toBcAccountGet★");
    var sql =
      "select tsha.bc_account as bc_account" +
      " from t_shain tsha" +
      " where tsha.delete_flg = '0' and tsha.t_shain_pk = :myPk";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db
      .query(sql, {
        replacements: {
          myPk: req.body.fromShainPk
        },
        type: db.QueryTypes.RAW
      })
      .spread(async (datas, metadata) => {
        console.log("★End toBcAccountGet★");
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
    console.log("★start bccoinget★");
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
    console.log("★end bccoinget★");
  });
}

/**
 * チャット既読取得用関数
 *
 * @param {*} req
 */
async function chatKidokuGet(req, fromShainPk, toShainPk) {
  return new Promise((resolve, reject) => {
    console.log("★ start chatKidokuGet");
    var sql =
      "select k.t_chat_pk as kidoku_pk from t_chat_kidoku k where k.from_shain_pk = :fromPk and k.t_shain_pk = :myPk ";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db
      .query(sql, {
        replacements: {
          myPk: toShainPk,
          fromPk: fromShainPk
        },
        type: db.QueryTypes.RAW
      })
      .spread(async (datas, metadata) => {
        console.log("★End chatKidokuGet");
        return resolve(datas);
      });
  });
}

/**
 * チャットPK取得用関数
 *
 * @param {*} req
 */
async function chatPkGet(req) {
  return new Promise((resolve, reject) => {
    console.log("★ start chatPkGet");
    var sql =
      "select max(c.t_chat_pk) from t_chat c where c.from_shain_pk = :fromPk and c.to_shain_pk = :myPk";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db
      .query(sql, {
        replacements: {
          myPk: req.body.loginShainPk,
          fromPk: req.body.fromShainPk
        },
        type: db.QueryTypes.RAW
      })
      .spread(async (datas, metadata) => {
        console.log("★End chatPkGet");
        return resolve(datas);
      });
  });
}

/**
 * チャット既読テーブル更新用関数
 * @param {*} tx
 * @param {*} req
 * @param {*} maxChatPk
 * @param {*} fromShainPk
 * @param {*} toShainPk
 */
async function updateChatKidoku(tx, req, maxChatPk, fromShainPk, toShainPk) {
  return new Promise((resolve, reject) => {
    console.log("★ start updateChatKidoku★");
    var sql =
      "update t_chat_kidoku set t_chat_pk = :chatPk, update_user_id = :userId, update_tm = current_timestamp where from_shain_pk = :fromPk and t_shain_pk = :myPk";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }
    db
      .query(sql, {
        transaction: tx,
        replacements: {
          chatPk: maxChatPk,
          myPk: toShainPk,
          fromPk: fromShainPk,
          userId: req.body.userid
        },
        type: db.QueryTypes.RAW
      })
      .spread(async (datas, metadata) => {
        console.log("★End updateChatKidoku★");
        return resolve(datas);
      });
  });
}

// /**
//  * チャット既読テーブルinsert用関数
//  * @param {*} tx
//  * @param {*} req
//  */
// function insertChatKidoku(req, userid, fromShainPk, toShainPk) {
//   return new Promise((resolve, reject) => {
//     var sql =
//       'insert into t_chat_kidoku (t_shain_pk, from_shain_pk, t_chat_pk, insert_user_id, insert_tm, update_user_id, update_tm) ' +
//       'VALUES (?, ?, ?, ?, current_timestamp, ?, ?) '
//     if (req.body.db_name != null && req.body.db_name != '') {
//       db = db2.sequelize3(req.body.db_name)
//     } else {
//       db = require('./common/sequelize_helper.js').sequelize
//     }

//     db
//       .query(sql, {
//         replacements: [toShainPk, fromShainPk, 0, userid, null, null]
//       })
//       .spread((datas, metadata) => {
//         console.log(datas)
//         return resolve(datas)
//       })
//   })
// }

/**
 * t_chatテーブルのinsert用関数
 * @param {*} tx
 * @param {*} req
 */
function insertChat(tx, req) {
  return new Promise((resolve, reject) => {
    console.log("★ start insertChat");
    var sql =
      "insert into t_chat (from_shain_pk, to_shain_pk, comment, post_dt, post_tm, t_coin_ido_pk, delete_flg, insert_user_id, insert_tm, update_user_id, update_tm) " +
      "VALUES (?, ?, pgp_sym_encrypt(?, 'comcomcoin_chat'), current_timestamp, current_timestamp, ?, ?, ?, current_timestamp, ?, ?) RETURNING t_chat_pk";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }

    db
      .query(sql, {
        transaction: tx,
        replacements: [
          req.body.loginShainPk,
          req.body.fromShainPk,
          req.body.comment,
          0,
          0,
          req.body.userid,
          null,
          null
        ]
      })
      .spread((datas, metadata) => {
        // console.log(datas);
        return resolve(datas[0].t_chat_pk);
      });
    console.log("★ end insertChat");
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
    db
      .query(sql, {
        transaction: tx,
        replacements: {
          zoyo_moto_shain_pk: req.body.loginShainPk,
          zoyo_saki_shain_pk: req.body.fromShainPk,
          transaction_id: transactionId,
          zoyo_comment: req.body.comment,
          nenji_flg: "3",
          insert_user_id: req.body.userid
        }
      })
      .spread((datas, metadata) => {
        // console.log(datas);
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
    console.log("★ start insertChat");
    var sql =
      "update t_chat set t_coin_ido_pk = ? " +
      "where t_chat_pk = ?";
    if (req.body.db_name != null && req.body.db_name != "") {
      db = db2.sequelize3(req.body.db_name);
    } else {
      db = require("./common/sequelize_helper.js").sequelize;
    }

    db
      .query(sql, {
        transaction: tx,
        replacements: [
          zoyoPk,
          t_chat_pk
        ]
      })
      .spread((datas, metadata) => {
        return resolve(datas)
      });
  });
}

/**
 * BCコイン送金用関数
 * @param {*} req
 */
function bcrequest(req, bc_account) {
  return new Promise((resolve, reject) => {
    console.log("★★BCコイン送金　開始★");
    var param = {
      from_account: [req.body.bcAccount],
      to_account: [bc_account],
      password: [req.body.password],
      coin: [req.body.sofuCoin],
      bc_addr: req.body.bc_addr
    };
    console.log(param);
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
    console.log("★★BCコイン送金　終了★");
  });
}

module.exports = router;
