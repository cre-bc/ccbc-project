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
// 所持コイン一覧は、検索条件なしで、社員とコイン情報のみ取得しグラフに表示
// /**
//  * 社員取得用関数
//  * @req {*} req
//  */
// function tShainGet(req) {
//   return new Promise((resolve, reject) => {
//     if (req.body.db_name != null && req.body.db_name != "") {
//       db = db2.sequelize3(req.body.db_name);
//     } else {
//       db = require("./common/sequelize_helper.js").sequelize;
//     }
//     var sql =
//       "select row_number() over () as id, *, tsha.t_shain_pk as t_shain_pk, tsha.shimei as shimei, tsha.image_file_nm as image_file_nm, tsha.bc_account as bc_account, null as title, tsha.kengen_cd as kengen_cd, tsha2.bc_account as from_bc_account, tsha2.shimei as fromShimei" +
//       " from t_shain tsha, t_shain tsha2 " +
//       " where tsha.delete_flg = '0' and tsha2.delete_flg = '0' and tsha.t_shain_pk <> :mypk and tsha2.t_shain_pk = :mypk order by tsha.kengen_cd";
//     db
//       .query(sql, {
//         replacements: { mypk: req.body.tShainPk },
//         type: db.QueryTypes.RAW
//       })
//       .spread((datas, metadata) => {
//         console.log("★★★");
//         console.log(datas);
//         console.log(datas[0].from_bc_account);

//         return resolve(datas);
//       });
//   });
// }
// /**
//  * 取引情報取得用関数(送付者）
//  * @req {*} req
//  */
// function ccCoinSendUserget(req) {
//   return new Promise((resolve, reject) => {
//     // SQLとパラメータを指定
//     var sql =
//       "select distinct(from_shain_pk)" +
//       "  from t_coin_ido" +
//       " where delete_flg = '0'" +
//       " order by from_shain_pk";
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

// /**
//  * 取引情報取得用関数(受領者）
//  * @req {*} req
//  */
// function ccCoinGetUserget(req) {
//   return new Promise((resolve, reject) => {
//     // SQLとパラメータを指定
//     var sql =
//       "select distinct(to_shain_pk)" +
//       "  from t_coin_ido" +
//       " where delete_flg = '0'" +
//       " order by to_shain_pk";
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

// /**
//  * 取引情報取得用関数(イベント）
//  * @req {*} req
//  */
// function ccCoinEventget(req) {
//   return new Promise((resolve, reject) => {
//     // SQLとパラメータを指定
//     var sql =
//       "select distinct(comment)" +
//       "  from t_coin_ido" +
//       " where delete_flg = '0'" +
//       " order by comment";
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
