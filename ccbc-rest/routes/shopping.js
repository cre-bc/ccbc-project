const request = require("superagent");
const express = require("express");
const router = express.Router();
const async = require("async");
var db = require("./common/sequelize_helper.js").sequelize;
var db2 = require("./common/sequelize_helper.js");
const bcdomain = require("./common/constans.js").bcdomain;
const jimuAccount = require("./common/constans.js").jimuAccount;
const jimuPassword = require('./common/constans.js').jimuPassword
const jimuShainPk = require("./common/constans.js").jimuShainPk;

/**
 * ★★★ TODOメモ ★★★
 * ・find　：　bccoingetのコメントを外す（bc-restがなくても動作するようにしています）
 * ・find　：　利用可能なコイン数の取得処理を追加する
 * ・pay 　：　利用可能なコイン数の取得処理を追加する
 * ・pay 　：　bcrequestのコメントを外す（bc-restがなくても動作するようにしています）
 * ・selectShohin　：　m_shohinにshohin_codeが存在していなかったため、SQLは暫定的
 */

/**
 * API : find
 * 現在の所持コイン数と募金先情報を取得
 */
router.post("/find", (req, res) => {
  console.log("API : find - start");
  find(req, res);
  console.log("API : find - end");
});

/**
 * API : checkQRCode
 * QRコードを解析し、ComComCoin用のQRコードであれば、商品情報を取得
 */
router.post("/checkQRCode", (req, res) => {
  console.log("API : checkQRCode - start");
  checkQRCode(req, res);
  console.log("API : checkQRCode - end");
});

/**
 * API : pay
 * 支払情報を登録し、BCのコインを移動
 */
router.post("/pay", (req, res) => {
  console.log("API : pay - start");
  pay(req, res);
  console.log("API : pay - end");
});

// ----------------------------------------------------------------------
/**
 * 現在の所持コイン数と募金先情報を取得
 * @param req リクエスト
 * @param res レスポンス
 */
async function find(req, res) {
  db = db2.sequelizeDB(req);
  var availableCoin = 0;

  // 募金先マスタの取得
  const resdatas = await selectBokin(db, req);

  // console.log(resdatas);

  // BCコイン数を取得
  const param = {
    account: req.body.bcAccount,
    bc_addr: req.body.bc_addr
  };
  availableCoin = await bccoinget(param);

  res.json({
    status: true,
    coin: availableCoin,
    bokinList: resdatas
  });
}

/**
 * QRコードを解析し、ComComCoin用のQRコードであれば、商品情報を取得
 * QRコードの仕様："CCC_" + 商品コード4桁
 * @param req リクエスト
 * @param res レスポンス
 */
async function checkQRCode(req, res) {
  db = db2.sequelizeDB(req);

  var qrcode = req.body.qrcode;
  console.log("QRコード:", qrcode);

  // QRコードを解析（NGの場合はstatus = falseで返却）
  var isError = false;
  if (qrcode === "") {
    isError = true;
  } else if (qrcode.length !== 8) {
    // 8桁でない場合はNG
    isError = true;
  } else if (qrcode.substr(0, 4) !== "CCC_") {
    // 先頭4桁が"CCC_"でない場合はNG
    isError = true;
  }
  if (isError) {
    res.json({ status: false });
    return;
  }

  // 末尾4桁の商品コードを取得
  var shohin_code = qrcode.substr(4, 4);
  console.log("商品コード:", shohin_code);

  // 商品マスタを取得
  const resdatas = await selectShohin(db, shohin_code);
  if (resdatas.length === 0) {
    // 商品マスタにデータがない場合はNG
    res.json({ status: false });
    return;
  }

  res.json({
    status: true,
    shohinInfo: resdatas[0]
  });
}

/**
 * 支払情報を登録し、BCのコインを移動
 * @param req リクエスト
 * @param res レスポンス
 */
async function pay(req, res) {
  db = db2.sequelizeDB(req);
  var availableCoin = 0;
  // 合計コインを算出
  var totalCoin = 0;
  var buyList = req.body.buyList;
  for (var i = 0; i < buyList.length; i++) {
    totalCoin += buyList[i].coin;
  }

  // BCコイン数を取得
  const param = {
    account: req.body.bcAccount,
    bc_addr: req.body.bc_addr
  };
  availableCoin = await bccoinget(param);
  var bokinCoin = totalCoin;

  // 合計コイン数が利用可能コイン数を上回る場合、NG
  if (totalCoin > availableCoin) {
    console.log(
      "コイン不足：totalCoin：" + totalCoin + " availableCoin：" + availableCoin
    );
    res.json({ status: false, coin: availableCoin });
    return;
  }

  db
    .transaction(async function (tx) {
      // 支払テーブルの追加
      var ret = await insertShiharai(db, tx, req, totalCoin);
      var shiharaiPk = ret[0].t_shiharai_pk;
      // console.log("shiharaiPk:", shiharaiPk);

      // 支払明細テーブルの追加
      var seq = 0;
      for (var i = 0; i < buyList.length; i++) {
        var shiharaiM = {
          seq_no: seq++,
          m_shohin_pk: buyList[i].m_shohin_pk,
          quantity: buyList[i].quantity,
          coin: buyList[i].coin
        };
        await insertShiharaiMeisai(db, tx, req, shiharaiPk, shiharaiM);
      }

      const transactionId = await bcrequest(req, totalCoin, req.body.bcAccount, jimuAccount, req.body.password);
      // const transactionId = "test";

      // 贈与テーブルの追加
      var ret = await insertZoyo(db, tx, req, transactionId);
      const zoyoPk = ret[0].t_zoyo_pk;

      // 出品者にコインを半分還元
      for (var i = 0; i < buyList.length; i++) {
        const resdatas = await selectSellerShain(db, buyList[i].shohin_code);
        var seller_bc_account = null;
        if (resdatas.length !== 0) {
          seller_bc_account = resdatas[0].bc_account;
        }
        if (seller_bc_account !== null) {
          const sellerCoin = Math.round(buyList[i].coin * 0.5);
          await bcrequest(req, sellerCoin, jimuAccount, seller_bc_account, jimuPassword);
          bokinCoin -= sellerCoin;
        }
      }

      // 支払テーブルに贈与PKを更新
      await updateShiharaiAfterZoyo(db, tx, req, shiharaiPk, zoyoPk, bokinCoin);
    })
    .then(result => {
      // コミットしたらこっち
      console.log("正常");
      res.json({ status: true });
    })
    .catch(e => {
      // ロールバックしたらこっち
      console.log("異常");
      console.log(e);
      res.json({ status: false });
    });
}

// ----------------------------------------------------------------------

/**
 *ログイン者 所持BCコイン取得用関数
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
 * 募金先マスタを取得（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
function selectBokin(db, req) {
  return new Promise((resolve, reject) => {
    var sql =
      "select m_bokin_pk, bokin_nm from m_bokin where delete_flg = '0' order by m_bokin_pk";
    db
      .query(sql, {
        type: db.QueryTypes.RAW
      })
      .spread((datas, metadata) => {
        return resolve(datas);
      });
  });
}

/**
 * 商品マスタを取得（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param shohin_code 商品コード
 */
function selectShohin(db, shohin_code) {
  return new Promise((resolve, reject) => {
    var sql =
      "select m_shohin_pk, shohin_code, shohin_nm1, shohin_nm2, coin from m_shohin where shohin_code = :shohin_code and delete_flg = '0'";

    db
      .query(sql, {
        replacements: { shohin_code: shohin_code },
        type: db.QueryTypes.RAW
      })
      .spread((datas, metadata) => {
        return resolve(datas);
      });
  });
}

/**
 * 支払（t_shiharai）テーブルのinsert
 * @param db SequelizeされたDBインスタンス
 * @param tx トランザクション
 * @param req リクエスト
 * @param totalCoin 合計コイン数
 */
function insertShiharai(db, tx, req, totalCoin) {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into t_shiharai (t_shain_pk, buy_dt, buy_tm, total_coin, m_bokin_pk, delete_flg, insert_user_id, insert_tm) " +
      " values (:t_shain_pk, current_timestamp, current_timestamp, :total_coin, :m_bokin_pk, '0', :insert_user_id, current_timestamp) " +
      " returning t_shiharai_pk";

    db
      .query(sql, {
        transaction: tx,
        replacements: {
          t_shain_pk: req.body.loginShainPk,
          total_coin: totalCoin,
          m_bokin_pk: req.body.m_bokin_pk,
          insert_user_id: req.body.userid
        }
      })
      .spread((datas, metadata) => {
        return resolve(datas);
      });
  });
}

/**
 * 支払明細（t_shiharai_meisai）テーブルのinsert
 * @param db SequelizeされたDBインスタンス
 * @param tx トランザクション
 * @param req リクエスト
 * @param shiharaiPk 支払テーブルPK
 * @param tShiharaiMeisai 支払明細テーブル情報
 */
function insertShiharaiMeisai(db, tx, req, shiharaiPk, tShiharaiMeisai) {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into t_shiharai_meisai (t_shiharai_pk, seq_no, m_shohin_pk, quantity, coin, delete_flg, insert_user_id, insert_tm) " +
      " values (:t_shiharai_pk, :seq_no, :m_shohin_pk, :quantity, :coin, '0', :user_id, current_timestamp) ";

    db
      .query(sql, {
        transaction: tx,
        replacements: {
          t_shiharai_pk: shiharaiPk,
          seq_no: tShiharaiMeisai.seq_no,
          m_shohin_pk: tShiharaiMeisai.m_shohin_pk,
          quantity: tShiharaiMeisai.quantity,
          coin: tShiharaiMeisai.coin,
          user_id: req.body.userid
        }
      })
      .spread((datas, metadata) => {
        return resolve(datas);
      });
  });
}

/**
 * 贈与情報（t_zoyo）テーブルのinsert
 * @param db SequelizeされたDBインスタンス
 * @param tx トランザクション
 * @param req リクエスト
 * @param transactionId BC登録時のトランザクションID
 */
function insertZoyo(db, tx, req, transactionId) {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into t_zoyo (zoyo_moto_shain_pk, zoyo_saki_shain_pk, transaction_id, zoyo_comment, nenji_flg, delete_flg, insert_user_id, insert_tm) " +
      " values (:zoyo_moto_shain_pk, :zoyo_saki_shain_pk, :transaction_id, :zoyo_comment, :nenji_flg, '0', :insert_user_id, current_timestamp) " +
      " returning t_zoyo_pk";

    db
      .query(sql, {
        transaction: tx,
        replacements: {
          zoyo_moto_shain_pk: req.body.loginShainPk,
          zoyo_saki_shain_pk: jimuShainPk,
          transaction_id: transactionId,
          zoyo_comment: "買い物",
          nenji_flg: "4",
          insert_user_id: req.body.userid
        }
      })
      .spread((datas, metadata) => {
        return resolve(datas);
      });
  });
}

/**
 * 支払（t_shiharai）テーブルへの贈与PK更新
 * @param db SequelizeされたDBインスタンス
 * @param tx トランザクション
 * @param req リクエスト
 * @param t_shiharai_pk 支払テーブルPK
 * @param t_zoyo_pk 贈与テーブルPK
 * @param bokin_coin 募金コイン
 */
function updateShiharaiAfterZoyo(db, tx, req, t_shiharai_pk, t_zoyo_pk, bokin_coin) {
  return new Promise((resolve, reject) => {
    var sql =
      "update t_shiharai set " +
      " t_coin_ido_pk = :t_zoyo_pk," +
      " bokin_coin = :bokin_coin" +
      " where t_shiharai_pk = :t_shiharai_pk";

    db
      .query(sql, {
        transaction: tx,
        replacements: {
          t_shiharai_pk: t_shiharai_pk,
          t_zoyo_pk: t_zoyo_pk,
          bokin_coin: bokin_coin
        }
      })
      .spread((datas, metadata) => {
        return resolve(datas);
      });
  });
}

/**
 * 出品者を取得（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param shohin_code 商品コード
 */
function selectSellerShain(db, shohin_code) {
  return new Promise((resolve, reject) => {
    var sql =
      "select a.coin, a.seller_shain_pk, b.bc_account from m_shohin a inner join t_shain b on a.seller_shain_pk = b.t_shain_pk where a.shohin_code = :shohin_code and a.delete_flg = '0'";

    db
      .query(sql, {
        replacements: { shohin_code: shohin_code },
        type: db.QueryTypes.RAW
      })
      .spread((datas, metadata) => {
        return resolve(datas);
      });
  });
}

/**
 * BCコイン送金用関数
 * @param req リクエスト
 * @param coin 移動コイン
 * @param fromAccount 送信者アカウント
 * @param toAccount 受信者アカウント
 * @param password パスワード（送信者）
 */
function bcrequest(req, coin, fromAccount, toAccount, password) {
  return new Promise((resolve, reject) => {
    var param = {
      from_account: [fromAccount],
      to_account: [toAccount],
      password: [password],
      coin: [coin],
      bc_addr: req.body.bc_addr
    };
    console.log("bcrequest.param:", param);
    request
      .post(bcdomain + "/bc-api/send_coin")
      .send(param)
      .end((err, res) => {
        if (err) {
          console.log("bcrequest.err:", err);
          return;
        }
        // 検索結果表示
        console.log("bcrequest.result.transaction:", res.body.transaction);
        return resolve(res.body.transaction[0]);
      });
  });
}

module.exports = router;
