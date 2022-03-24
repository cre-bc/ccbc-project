const request = require("superagent");
const express = require("express");
const router = express.Router();
const async = require("async");
const db = require("./common/sequelize_helper.js").sequelize;
//const db = require('./common/pg_helper.js')
const bcdomain = require("./common/constans.js").bcdomain;

var path = require("path");
var multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/home/BLOCKCHAIN/ccbc-rest/public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
var upload = multer({ storage: storage });

router.post("/find", (req, res) => {
  findData(req, res);
});

/**
 * データ取得用関数
 *
 * @param {*} req
 * @param {*} res
 */
async function findData(req, res) {
  // 社員マスタ取得（社員PKは前画面からのパラメータとして取得）
  var tShain = [];
  tShain = await getTShain(req.body.inputTShainPk);

  // 権限マスタ取得
  var mKengen = [];
  var kengen = "";
  if (tShain.length != 0) {
    kengen = tShain[0].kengen_cd;
  }
  mKengen = await getMKengen(kengen);

  // DBから取得できた場合、ユーザID・パスワード変更をさせないためフラグをセット
  if (req.body.inputTShainPk !== 0) {
    tShain[0].updateFlg = true;
  }

  res.json({ status: true, kengenList: mKengen, shainData: tShain });
}

/**
 * 権限マスタの取得
 */
async function getMKengen(kengen_cd) {
  return new Promise((resolve, reject) => {
    var sql =
      "select m_kengen_pk ,kengen_cd ,kengen_nm from m_kengen where kengen_cd <> '0' and delete_flg = '0' order by kengen_cd";
    if (kengen_cd === "0") {
      sql =
        "select m_kengen_pk ,kengen_cd ,kengen_nm from m_kengen where  delete_flg = '0' order by kengen_cd";
    }
    db.query(sql, {
      type: db.QueryTypes.RAW,
    }).spread(async (datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * 社員マスタ取得
 *
 * @param {*} paramTShainPk
 */
async function getTShain(paramTShainPk) {
  return new Promise((resolve, reject) => {
    var sql =
      "select t_shain_pk ,user_id ,shimei ,shimei_kana ,image_file_nm ,kengen_cd ,bc_account  from t_shain where t_shain_pk = :tShainPk and delete_flg = '0'";

    db.query(sql, {
      replacements: { tShainPk: paramTShainPk },
      type: db.QueryTypes.RAW,
    }).spread(async (datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 *
 */
router.post("/create", upload.fields([{ name: "image" }]), (req, res) => {
  // トークンチェック
  var sql =
    "select token" +
    " from t_shain tsha" +
    " where tsha.delete_flg = '0' and tsha.token = :mytoken";
  db.query(sql, {
    replacements: { mytoken: req.body.tokenId },
    type: db.QueryTypes.RAW,
  }).spread(async (datas, metadata) => {
    if (datas.length == 0) {
      res.json({ status: false, tokencheck: false });
      return;
    }
  });

  if (req.body.updateFlg === "true") {
    req.body.updateFlg = true;
  } else if (req.body.updateFlg === "false") {
    req.body.updateFlg = false;
  }

  db.transaction(async function (tx) {
    // 登録処理
    var resdatas = [];
    await processInsert(req, res, tx, resdatas);
  })
    .then((result) => {
    })
    .catch((e) => {
      // ロールバックしたらこっち
      console.log("★★異常★★");
      console.log(e);
    });
});

/**
 * 登録処理
 */
async function processInsert(req, res, tx, resdatas) {
  // 登録の場合1レコード以上取得できた場合、エラー
  var selectUserIdList = [];
  if (!req.body.updateFlg) {
    selectUserIdList = await checkUserId(req.body.inputUserId, tx);
    if (selectUserIdList.length >= 1) {
      res.json({ status: false, tokencheck: true });
      return;
    }
  }

  // 社員テーブル登録処理
  if (req.body.updateFlg) {
    await updateTShain(tx, req, resdatas);
  } else {
    var result = await bcrequest(req);
    await insertTShain(tx, req, resdatas, result.body.bc_account);
  }

  res.json({ status: true, tokencheck: true });
  return;
}

/**
 * ユーザIDによる検索
 * @param {*} paramUserId
 * @param {*} tx
 */
async function checkUserId(paramUserId, tx) {
  return new Promise((resolve, reject) => {
    var sql =
      "select t_shain_pk ,user_id ,shimei ,shimei_kana ,image_file_nm ,kengen_cd ,bc_account  from t_shain where user_id = :userId and delete_flg = '0'";

    db.query(sql, {
      transaction: tx,
      replacements: { userId: paramUserId },
      type: db.QueryTypes.RAW,
    }).spread(async (datas, metadata) => {
      return resolve(datas);
    });
  });
}

/**
 * 社員情報登録呼び出し
 *
 * @param {*} req
 */
function bcrequest(req) {
  return new Promise((resolve, reject) => {
    var param = {
      password: req.body.inputPassword,
      bc_addr: req.body.bc_addr,
    };

    request
      .post(bcdomain + "/bc-api/add_account")
      .send(param)
      .end((err, res) => {
        if (err) {
          console.log("★" + err);
          return;
        }
        // 検索結果表示
        // console.log("★★★res:" + res);
        return resolve(res);
      });
  });
}

/**
 * 社員テーブル登録処理
 */
async function insertTShain(tx, req, resdatas, bcaccount) {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into t_shain( user_id, shimei, image_file_nm, kengen_cd, bc_account, delete_flg, insert_user_id, insert_tm, shimei_kana ) values( ?, ?, ?, ?, ?, ?, ?, current_timestamp, ? )";
    db.query(sql, {
      transaction: tx,
      replacements: [
        req.body.inputUserId,
        req.body.inputShimeiKanji,
        req.body.filename,
        req.body.inputKengenCd,
        bcaccount,
        "0",
        req.body.userid,
        req.body.inputShimeiKana,
      ],
    }).spread((datas, metadata) => {
      resdatas.push(datas);
      return resolve(datas);
    });
  });
}

/**
 * 社員テーブル更新処理
 *
 * @param {*} tx
 * @param {*} req
 * @param {*} resdatas
 */
async function updateTShain(tx, req, resdatas) {
  return new Promise((resolve, reject) => {
    var sql =
      "update t_shain set shimei = ?, image_file_nm = ?, kengen_cd = ?, update_user_id = ?, update_tm = current_timestamp, shimei_kana = ? where delete_flg = '0' and t_shain_pk = ?";

    db.query(sql, {
      transaction: tx,
      replacements: [
        req.body.inputShimeiKanji,
        req.body.filename,
        req.body.inputKengenCd,
        req.body.userid,
        req.body.inputShimeiKana,
        req.body.inputTShainPk,
      ],
    }).spread((datas, metadata) => {
      resdatas.push(datas);
      return resolve(datas);
    });
  });
}

module.exports = router;
