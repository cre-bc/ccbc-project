const request = require("superagent");
const express = require("express");
const router = express.Router();
const async = require("async");
const db = require("./common/sequelize_helper.js").sequelize;
const bcdomain = require("./common/constans.js").bcdomain;
const findGetCoinAllSql =
  "select row_number() over () as id, tsha.t_shain_pk as t_shain_pk, tsha2.shimei as shimei, tsha.bc_account as bc_account, tzo.zoyo_saki_shain_pk as zoyo_saki_shain_pk, to_char(tzo.insert_tm,'yyyy/mm/dd') as insert_tm, tzo.transaction_id as transaction_id, tzo.t_zoyo_pk as t_zoyo_pk, tto.t_tohyo_pk as t_tohyo_pk, (case when tto.t_tohyo_pk is null then '贈与' else tpr.title end) as title" +
  " from t_shain tsha inner join t_zoyo tzo on tsha.t_shain_pk = tzo.zoyo_saki_shain_pk" +
  " inner join t_shain tsha2 on tzo.zoyo_moto_shain_pk = tsha2.t_shain_pk" +
  " left join t_tohyo tto on tzo.transaction_id = tto.transaction_id and tto.delete_flg = '0'" +
  " left join t_presenter tpr on tto.t_presenter_pk = tpr.t_presenter_pk and tpr.delete_flg = '0'" +
  " where tsha.delete_flg = '0' and tzo.delete_flg = '0' ";
const findGetCoinSql =
  "select row_number() over () as id, tsha.t_shain_pk as t_shain_pk, tsha2.shimei as shimei, tsha.bc_account as bc_account, tzo.zoyo_saki_shain_pk as zoyo_saki_shain_pk, to_char(tzo.insert_tm,'yyyy/mm/dd') as insert_tm, tzo.transaction_id as transaction_id, tzo.t_zoyo_pk as t_zoyo_pk, tto.t_tohyo_pk as t_tohyo_pk, (case when tto.t_tohyo_pk is null then '贈与' else tpr.title end) as title" +
  " from t_shain tsha inner join (select a.* from t_zoyo a inner join t_shain b on a.zoyo_moto_shain_pk = b.t_shain_pk  where kengen_cd <> '0') tzo on tsha.t_shain_pk = tzo.zoyo_saki_shain_pk" +
  " inner join t_shain tsha2 on tzo.zoyo_moto_shain_pk = tsha2.t_shain_pk" +
  " left join t_tohyo tto on tzo.transaction_id = tto.transaction_id and tto.delete_flg = '0'" +
  " left join t_presenter tpr on tto.t_presenter_pk = tpr.t_presenter_pk and tpr.delete_flg = '0'" +
  " where tsha.delete_flg = '0' and tzo.delete_flg = '0' and tsha.kengen_cd <> '0' ";
const findTakeCoinAllSql =
  "select row_number() over () as id, tsha.t_shain_pk as t_shain_pk, tsha2.shimei as shimei, tsha.bc_account as bc_account, tzo.zoyo_moto_shain_pk as zoyo_saki_shain_pk, to_char(tzo.insert_tm,'yyyy/mm/dd') as insert_tm, tzo.transaction_id as transaction_id, tzo.t_zoyo_pk as t_zoyo_pk, tto.t_tohyo_pk as t_tohyo_pk, (case when tto.t_tohyo_pk is null then '贈与' else tpr.title end) as title" +
  " from t_shain tsha inner join t_zoyo tzo on tsha.t_shain_pk = tzo.zoyo_moto_shain_pk " +
  " inner join t_shain tsha2 on tzo.zoyo_saki_shain_pk = tsha2.t_shain_pk" +
  " left join t_tohyo tto on tzo.transaction_id = tto.transaction_id and tto.delete_flg = '0'" +
  " left join t_presenter tpr on tto.t_presenter_pk = tpr.t_presenter_pk and tpr.delete_flg = '0'" +
  " where tsha.delete_flg = '0' and tzo.delete_flg = '0' ";
const findTakeCoinSql =
  "select row_number() over () as id, tsha.t_shain_pk as t_shain_pk, tsha2.shimei as shimei, tsha.bc_account as bc_account, tzo.zoyo_moto_shain_pk as zoyo_saki_shain_pk, to_char(tzo.insert_tm,'yyyy/mm/dd') as insert_tm, tzo.transaction_id as transaction_id, tzo.t_zoyo_pk as t_zoyo_pk, tto.t_tohyo_pk as t_tohyo_pk, (case when tto.t_tohyo_pk is null then '贈与' else tpr.title end) as title" +
  " from t_shain tsha inner join (select a.* from t_zoyo a inner join t_shain b on a.zoyo_saki_shain_pk = b.t_shain_pk  where kengen_cd <> '0') tzo on tsha.t_shain_pk = tzo.zoyo_moto_shain_pk " +
  " inner join t_shain tsha2 on tzo.zoyo_saki_shain_pk = tsha2.t_shain_pk" +
  " left join t_tohyo tto on tzo.transaction_id = tto.transaction_id and tto.delete_flg = '0'" +
  " left join t_presenter tpr on tto.t_presenter_pk = tpr.t_presenter_pk and tpr.delete_flg = '0'" +
  " where tsha.delete_flg = '0' and tzo.delete_flg = '0' and tsha.kengen_cd <> '0'";
const countHappyoSuSql =
  "select count(*) as happyoSu" +
  " from t_presenter tpre" +
  " where tpre.delete_flg = '0' and tpre.t_shain_pk = :mypk ";
router.post("/find", (req, res) => {
  finddata(req, res);
  console.log("end");
});

router.post("/findChange", (req, res) => {
  console.log("findChange実行");
  finddataChange(req, res);
  console.log("end");
});

/**
 * 初期表示データ取得用関数
 * @req {*} req
 * @res {*} res
 */
async function finddata(req, res) {
  var getCoinDatasAll = [];
  var getCoinDatas = [];
  var takeCoinDatasAll = [];
  var takeCoinDatas = [];
  var shainDatas = [];
  var nendoDatas = [];
  var happyoSuData = [];
  var bccoin = 0;
  shainDatas = await findTShain(req);
  nendoDatas = await findNendo(req);
  // if (req.body.kengenCd === '2' || req.body.kengenCd === '3') {
  //   happyoSuData = await countHappyoSu(req, 0)
  //   var happyoSu = happyoSuData[0].happyosu
  //   console.log(happyoSu)
  // } else {
  //   var happyoSu = '-'
  //   console.log('発表数：' + happyoSu)
  // }
  happyoSuData = await countHappyoSu(req, 0);
  var happyoSu = happyoSuData[0].happyosu;
  console.log(happyoSu);

  var allGetCoinSu = 0;
  var getCoinSu = 0;
  var allTakeCoinSu = 0;
  var takeCoinSu = 0;

  res.json({
    status: true,
    getCoinDatasAll: getCoinDatasAll,
    getCoinDatas: getCoinDatas,
    takeCoinDatasAll: takeCoinDatasAll,
    takeCoinDatas: takeCoinDatas,
    shainDatas: shainDatas,
    nendoDatas: nendoDatas,
    allGetCoinSu: allGetCoinSu,
    getCoinSu: getCoinSu,
    allTakeCoinSu: allTakeCoinSu,
    takeCoinSu: takeCoinSu,
    happyoSu: happyoSu,
  });
}

/**
 * データ取得用関数（検索条件変更）
 * @req {*} req
 * @res {*} res
 */
async function finddataChange(req, res) {
  var getCoinDatasAll = [];
  var getCoinDatas = [];
  var takeCoinDatasAll = [];
  var takeCoinDatas = [];
  var bccoin = 0;
  happyoSuData = await countHappyoSu(req, 1);
  var happyoSu = happyoSuData[0].happyosu;
  console.log(happyoSu);

  getCoinDatasAll = await findGetCoinAll(req, 1);
  getCoinDatas = await findGetCoin(req, 1);
  takeCoinDatasAll = await findTakeCoinAll(req, 1);
  takeCoinDatas = await findTakeCoin(req, 1);

  var allGetCoinSu = 0;
  var getCoinSu = 0;
  var allTakeCoinSu = 0;
  var takeCoinSu = 0;
  for (var x in getCoinDatasAll) {
    param = {
      transaction: getCoinDatasAll[x].transaction_id,
    };
    var bccoin = await bccoinget(param);
    getCoinDatasAll[x].coin = bccoin;
    allGetCoinSu = allGetCoinSu + bccoin;
  }

  for (var x in getCoinDatas) {
    param = {
      transaction: getCoinDatas[x].transaction_id,
    };
    var bccoin = await bccoinget(param);
    getCoinDatas[x].coin = bccoin;
    getCoinSu = getCoinSu + bccoin;
  }

  for (var x in takeCoinDatasAll) {
    param = {
      transaction: takeCoinDatasAll[x].transaction_id,
    };
    var bccoin = await bccoinget(param);
    takeCoinDatasAll[x].coin = bccoin;
    allTakeCoinSu = allTakeCoinSu + bccoin;
  }

  for (var x in takeCoinDatas) {
    param = {
      transaction: takeCoinDatas[x].transaction_id,
    };
    var bccoin = await bccoinget(param);
    takeCoinDatas[x].coin = bccoin;
    takeCoinSu = takeCoinSu + bccoin;
  }
  res.json({
    status: true,
    getCoinDatasAll: getCoinDatasAll,
    getCoinDatas: getCoinDatas,
    takeCoinDatasAll: takeCoinDatasAll,
    takeCoinDatas: takeCoinDatas,
    allGetCoinSu: allGetCoinSu,
    getCoinSu: getCoinSu,
    allTakeCoinSu: allTakeCoinSu,
    takeCoinSu: takeCoinSu,
    happyoSu: happyoSu,
  });
}

/**
 * 獲得コイン情報取得用関数
 * @req {*} req
 * @shoriId {*} 処理ID
 */
function findGetCoinAll(req, shoriId) {
  return new Promise((resolve, reject) => {
    console.log("社員PK:" + req.body.tShainPk);
    console.log("処理ID:" + shoriId);
    console.log("権限CD:" + req.body.kengenCd);
    console.log("年度:" + req.body.year_info);
    console.log("氏名:" + req.body.target_manager);
    // 初期表示の場合
    if (shoriId == 0) {
      if (req.body.kengenCd == "1" || req.body.kengenCd == "0") {
        var sql = findGetCoinAllSql + "order by tzo.insert_tm desc";
        db.query(sql, {
          type: db.QueryTypes.RAW,
        }).spread((datas, metadata) => {
          return resolve(datas);
        });
      } else {
        var sql =
          findGetCoinAllSql +
          "and tsha.t_shain_pk = :mypk order by tzo.insert_tm desc";
        db.query(sql, {
          replacements: { mypk: req.body.tShainPk },
          type: db.QueryTypes.RAW,
        }).spread((datas, metadata) => {
          return resolve(datas);
        });
      }
    } else {
      console.log("検索処理実行");
      console.log("権限CD:" + req.body.kengenCd);
      // 検索条件ありの場合
      var nendo = req.body.year_info;
      var manager = req.body.target_manager;
      if (req.body.kengenCd == "1" || req.body.kengenCd == "0") {
        if (nendo != "" && manager != "") {
          var nendoStart = nendo + "/04/01";
          var nendoEnd = parseInt(nendo) + 1;
          nendoEnd = nendoEnd + "/03/31";
          var sql =
            findGetCoinAllSql +
            "and to_char(tzo.insert_tm,'yyyy/mm/dd') >= :nendoStart and :nendoEnd >= to_char(tzo.insert_tm, 'yyyy/mm/dd') and tsha.t_shain_pk = :maneger order by tzo.insert_tm desc";
          db.query(sql, {
            replacements: {
              nendoStart: nendoStart,
              nendoEnd: nendoEnd,
              maneger: manager,
            },
            type: db.QueryTypes.RAW,
          }).spread((datas, metadata) => {
            return resolve(datas);
          });
        } else if (nendo != "" && manager == "") {
          var nendoStart = nendo + "/04/01";
          var nendoEnd = parseInt(nendo) + 1;
          nendoEnd = nendoEnd + "/03/31";
          var sql =
            findGetCoinAllSql +
            "and to_char(tzo.insert_tm,'yyyy/mm/dd') >= :nendoStart and :nendoEnd >= to_char(tzo.insert_tm, 'yyyy/mm/dd') order by tzo.insert_tm desc";
          db.query(sql, {
            replacements: {
              nendoStart: nendoStart,
              nendoEnd: nendoEnd,
            },
            type: db.QueryTypes.RAW,
          }).spread((datas, metadata) => {
            return resolve(datas);
          });
        } else if (nendo == "" && manager != "") {
          var sql =
            findGetCoinAllSql +
            "and tsha.t_shain_pk = :maneger order by tzo.insert_tm desc";
          db.query(sql, {
            replacements: { maneger: manager },
            type: db.QueryTypes.RAW,
          }).spread((datas, metadata) => {
            return resolve(datas);
          });
        } else {
          var sql = findGetCoinAllSql + "order by tzo.insert_tm desc";
          db.query(sql, {
            type: db.QueryTypes.RAW,
          }).spread((datas, metadata) => {
            return resolve(datas);
          });
        }
      } else {
        if (nendo != "") {
          var nendoStart = nendo + "/04/01";
          var nendoEnd = parseInt(nendo) + 1;
          nendoEnd = nendoEnd + "/03/31";
          var sql =
            findGetCoinAllSql +
            "and tsha.t_shain_pk = :mypk and to_char(tzo.insert_tm,'yyyy/mm/dd') >= :nendoStart and :nendoEnd >= to_char(tzo.insert_tm, 'yyyy/mm/dd') order by tzo.insert_tm desc";
          db.query(sql, {
            replacements: {
              mypk: req.body.tShainPk,
              nendoStart: nendoStart,
              nendoEnd: nendoEnd,
            },
            type: db.QueryTypes.RAW,
          }).spread((datas, metadata) => {
            return resolve(datas);
          });
        } else {
          var sql =
            findGetCoinAllSql +
            "and tsha.t_shain_pk = :mypk order by tzo.insert_tm desc";
          db.query(sql, {
            replacements: {
              mypk: req.body.tShainPk,
            },
            type: db.QueryTypes.RAW,
          }).spread((datas, metadata) => {
            return resolve(datas);
          });
        }
      }
    }
  });
}
/**
 * 獲得コイン情報取得用関数
 * @req {*} req
 * @shoriId {*} 処理ID
 */
function findGetCoin(req, shoriId) {
  return new Promise((resolve, reject) => {
    console.log("社員PK:" + req.body.tShainPk);
    console.log("処理ID:" + shoriId);
    console.log("権限CD:" + req.body.kengenCd);
    console.log("年度:" + req.body.year_info);
    console.log("氏名:" + req.body.target_manager);
    // 初期表示の場合
    if (shoriId == 0) {
      console.log("初期処理実行");
      if (req.body.kengenCd == "1" || req.body.kengenCd == "0") {
        var sql = findGetCoinSql + "order by tzo.insert_tm desc";
        db.query(sql, {
          type: db.QueryTypes.RAW,
        }).spread((datas, metadata) => {
          return resolve(datas);
        });
      } else {
        var sql =
          findGetCoinSql +
          "and tsha.t_shain_pk = :mypk order by tzo.insert_tm desc";
        db.query(sql, {
          replacements: { mypk: req.body.tShainPk },
          type: db.QueryTypes.RAW,
        }).spread((datas, metadata) => {
          return resolve(datas);
        });
      }
    } else {
      console.log("検索処理実行");
      // 検索条件ありの場合
      var nendo = req.body.year_info;
      var manager = req.body.target_manager;
      if (req.body.kengenCd == "1" || req.body.kengenCd == "0") {
        if (nendo != "" && manager != "") {
          var nendoStart = nendo + "/04/01";
          var nendoEnd = parseInt(nendo) + 1;
          nendoEnd = nendoEnd + "/03/31";
          var sql =
            findGetCoinSql +
            "and to_char(tzo.insert_tm,'yyyy/mm/dd') >= :nendoStart and :nendoEnd >= to_char(tzo.insert_tm, 'yyyy/mm/dd') and tsha.t_shain_pk = :maneger order by tzo.insert_tm desc";
          db.query(sql, {
            replacements: {
              nendoStart: nendoStart,
              nendoEnd: nendoEnd,
              maneger: manager,
            },
            type: db.QueryTypes.RAW,
          }).spread((datas, metadata) => {
            return resolve(datas);
          });
        } else if (nendo != "" && manager == "") {
          var nendoStart = nendo + "/04/01";
          var nendoEnd = parseInt(nendo) + 1;
          nendoEnd = nendoEnd + "/03/31";
          var sql =
            findGetCoinSql +
            "and to_char(tzo.insert_tm,'yyyy/mm/dd') >= :nendoStart and :nendoEnd >= to_char(tzo.insert_tm, 'yyyy/mm/dd') order by tzo.insert_tm desc";
          db.query(sql, {
            replacements: {
              nendoStart: nendoStart,
              nendoEnd: nendoEnd,
            },
            type: db.QueryTypes.RAW,
          }).spread((datas, metadata) => {
            return resolve(datas);
          });
        } else if (nendo == "" && manager != "") {
          var sql =
            findGetCoinSql +
            "and tsha.t_shain_pk = :maneger order by tzo.insert_tm desc";
          db.query(sql, {
            replacements: { maneger: manager },
            type: db.QueryTypes.RAW,
          }).spread((datas, metadata) => {
            return resolve(datas);
          });
        } else {
          var sql = findGetCoinSql + "order by tzo.insert_tm desc";
          db.query(sql, {
            type: db.QueryTypes.RAW,
          }).spread((datas, metadata) => {
            return resolve(datas);
          });
        }
      } else {
        if (nendo != "") {
          var nendoStart = nendo + "/04/01";
          var nendoEnd = parseInt(nendo) + 1;
          nendoEnd = nendoEnd + "/03/31";
          var sql =
            findGetCoinSql +
            "and tsha.t_shain_pk = :mypk and to_char(tzo.insert_tm,'yyyy/mm/dd') >= :nendoStart and :nendoEnd >= to_char(tzo.insert_tm, 'yyyy/mm/dd') order by tzo.insert_tm desc";
          db.query(sql, {
            replacements: {
              mypk: req.body.tShainPk,
              nendoStart: nendoStart,
              nendoEnd: nendoEnd,
            },
            type: db.QueryTypes.RAW,
          }).spread((datas, metadata) => {
            return resolve(datas);
          });
        } else {
          var sql =
            findGetCoinSql +
            "and tsha.t_shain_pk = :mypk order by tzo.insert_tm desc";
          db.query(sql, {
            replacements: {
              mypk: req.body.tShainPk,
            },
            type: db.QueryTypes.RAW,
          }).spread((datas, metadata) => {
            return resolve(datas);
          });
        }
      }
    }
  });
}
/**
 * 投票コイン情報取得用関数
 * @req {*} req
 * @shoriId {*} 処理ID
 */
function findTakeCoinAll(req, shoriId) {
  return new Promise((resolve, reject) => {
    if (shoriId == 0) {
      if (req.body.kengenCd == "1" || req.body.kengenCd == "0") {
        var sql = findTakeCoinAllSql + "order by tzo.insert_tm desc";
        db.query(sql, {
          type: db.QueryTypes.RAW,
        }).spread((datas, metadata) => {
          return resolve(datas);
        });
      } else {
        var sql =
          findTakeCoinAllSql +
          "and tsha.t_shain_pk = :mypk order by tzo.insert_tm desc";
        db.query(sql, {
          replacements: { mypk: req.body.tShainPk },
          type: db.QueryTypes.RAW,
        }).spread((datas, metadata) => {
          return resolve(datas);
        });
      }
    } else {
      // 検索条件ありの場合
      var nendo = req.body.year_info;
      var manager = req.body.target_manager;
      if (req.body.kengenCd == "1" || req.body.kengenCd == "0") {
        if (nendo != "" && manager != "") {
          var nendoStart = nendo + "/04/01";
          var nendoEnd = parseInt(nendo) + 1;
          nendoEnd = nendoEnd + "/03/31";
          var sql =
            findTakeCoinAllSql +
            "and to_char(tzo.insert_tm,'yyyy/mm/dd') >= :nendoStart and :nendoEnd >= to_char(tzo.insert_tm, 'yyyy/mm/dd') and tsha.t_shain_pk = :maneger order by tzo.insert_tm desc";
          db.query(sql, {
            replacements: {
              nendoStart: nendoStart,
              nendoEnd: nendoEnd,
              maneger: manager,
            },
            type: db.QueryTypes.RAW,
          }).spread((datas, metadata) => {
            return resolve(datas);
          });
        } else if (nendo != "" && manager == "") {
          var nendoStart = nendo + "/04/01";
          var nendoEnd = parseInt(nendo) + 1;
          nendoEnd = nendoEnd + "/03/31";
          var sql =
            findTakeCoinAllSql +
            "and to_char(tzo.insert_tm,'yyyy/mm/dd') >= :nendoStart and :nendoEnd >= to_char(tzo.insert_tm, 'yyyy/mm/dd') order by tzo.insert_tm desc";
          db.query(sql, {
            replacements: {
              nendoStart: nendoStart,
              nendoEnd: nendoEnd,
            },
            type: db.QueryTypes.RAW,
          }).spread((datas, metadata) => {
            return resolve(datas);
          });
        } else if (nendo == "" && manager != "") {
          var sql =
            findTakeCoinAllSql +
            "and tsha.t_shain_pk = :maneger order by tzo.insert_tm desc";
          db.query(sql, {
            replacements: { maneger: manager },
            type: db.QueryTypes.RAW,
          }).spread((datas, metadata) => {
            return resolve(datas);
          });
        } else {
          var sql = findTakeCoinAllSql + "order by tzo.insert_tm desc";
          db.query(sql, {
            type: db.QueryTypes.RAW,
          }).spread((datas, metadata) => {
            return resolve(datas);
          });
        }
      } else {
        if (nendo != "") {
          var nendoStart = nendo + "/04/01";
          var nendoEnd = parseInt(nendo) + 1;
          nendoEnd = nendoEnd + "/03/31";
          var sql =
            findTakeCoinAllSql +
            "and tsha.t_shain_pk = :mypk and to_char(tzo.insert_tm,'yyyy/mm/dd') >= :nendoStart and :nendoEnd >= to_char(tzo.insert_tm, 'yyyy/mm/dd') order by tzo.insert_tm desc";
          db.query(sql, {
            replacements: {
              mypk: req.body.tShainPk,
              nendoStart: nendoStart,
              nendoEnd: nendoEnd,
            },
            type: db.QueryTypes.RAW,
          }).spread((datas, metadata) => {
            return resolve(datas);
          });
        } else {
          var sql =
            findTakeCoinAllSql +
            "and tsha.t_shain_pk = :mypk order by tzo.insert_tm desc";
          db.query(sql, {
            replacements: {
              mypk: req.body.tShainPk,
            },
            type: db.QueryTypes.RAW,
          }).spread((datas, metadata) => {
            return resolve(datas);
          });
        }
      }
    }
  });
}
/**
 * 投票コイン情報取得用関数
 * @req {*} req
 * @shoriId {*} 処理ID
 */
function findTakeCoin(req, shoriId) {
  return new Promise((resolve, reject) => {
    if (shoriId == 0) {
      if (req.body.kengenCd == "1" || req.body.kengenCd == "0") {
        var sql = findTakeCoinSql + "order by tzo.insert_tm desc";
        db.query(sql, {
          type: db.QueryTypes.RAW,
        }).spread((datas, metadata) => {
          return resolve(datas);
        });
      } else {
        var sql =
          findTakeCoinSql +
          "and tsha.t_shain_pk = :mypk order by tzo.insert_tm desc";
        db.query(sql, {
          replacements: { mypk: req.body.tShainPk },
          type: db.QueryTypes.RAW,
        }).spread((datas, metadata) => {
          return resolve(datas);
        });
      }
    } else {
      // 検索条件ありの場合
      var nendo = req.body.year_info;
      var manager = req.body.target_manager;
      if (req.body.kengenCd == "1" || req.body.kengenCd == "0") {
        if (nendo != "" && manager != "") {
          var nendoStart = nendo + "/04/01";
          var nendoEnd = parseInt(nendo) + 1;
          nendoEnd = nendoEnd + "/03/31";
          var sql =
            findTakeCoinSql +
            "and to_char(tzo.insert_tm,'yyyy/mm/dd') >= :nendoStart and :nendoEnd >= to_char(tzo.insert_tm, 'yyyy/mm/dd') and tsha.t_shain_pk = :maneger order by tzo.insert_tm desc";
          db.query(sql, {
            replacements: {
              nendoStart: nendoStart,
              nendoEnd: nendoEnd,
              maneger: manager,
            },
            type: db.QueryTypes.RAW,
          }).spread((datas, metadata) => {
            return resolve(datas);
          });
        } else if (nendo != "" && manager == "") {
          var nendoStart = nendo + "/04/01";
          var nendoEnd = parseInt(nendo) + 1;
          nendoEnd = nendoEnd + "/03/31";
          var sql =
            findTakeCoinSql +
            "and to_char(tzo.insert_tm,'yyyy/mm/dd') >= :nendoStart and :nendoEnd >= to_char(tzo.insert_tm, 'yyyy/mm/dd') order by tzo.insert_tm desc";
          db.query(sql, {
            replacements: {
              nendoStart: nendoStart,
              nendoEnd: nendoEnd,
            },
            type: db.QueryTypes.RAW,
          }).spread((datas, metadata) => {
            return resolve(datas);
          });
        } else if (nendo == "" && manager != "") {
          var sql =
            findTakeCoinSql +
            "and tsha.t_shain_pk = :maneger order by tzo.insert_tm desc";
          db.query(sql, {
            replacements: { maneger: manager },
            type: db.QueryTypes.RAW,
          }).spread((datas, metadata) => {
            return resolve(datas);
          });
        } else {
          var sql = findTakeCoinSql + "order by tzo.insert_tm desc";
          db.query(sql, {
            type: db.QueryTypes.RAW,
          }).spread((datas, metadata) => {
            return resolve(datas);
          });
        }
      } else {
        if (nendo != "") {
          var nendoStart = nendo + "/04/01";
          var nendoEnd = parseInt(nendo) + 1;
          nendoEnd = nendoEnd + "/03/31";
          var sql =
            findTakeCoinSql +
            "and tsha.t_shain_pk = :mypk and to_char(tzo.insert_tm,'yyyy/mm/dd') >= :nendoStart and :nendoEnd >= to_char(tzo.insert_tm, 'yyyy/mm/dd') order by tzo.insert_tm desc";
          db.query(sql, {
            replacements: {
              mypk: req.body.tShainPk,
              nendoStart: nendoStart,
              nendoEnd: nendoEnd,
            },
            type: db.QueryTypes.RAW,
          }).spread((datas, metadata) => {
            return resolve(datas);
          });
        } else {
          var sql =
            findTakeCoinSql +
            "and tsha.t_shain_pk = :mypk order by tzo.insert_tm desc";
          db.query(sql, {
            replacements: {
              mypk: req.body.tShainPk,
            },
            type: db.QueryTypes.RAW,
          }).spread((datas, metadata) => {
            return resolve(datas);
          });
        }
      }
    }
  });
}
/**
 * 社員情報取得用関数
 * @req {*} req
 */
function findTShain(req) {
  return new Promise((resolve, reject) => {
    var sql =
      "select row_number() over () as id, tsha.t_shain_pk as t_shain_pk, tsha.shimei as shimei, tsha.bc_account as bc_account" +
      " from t_shain tsha" +
      " where tsha.delete_flg = '0' ";
    db.query(sql, {
      type: db.QueryTypes.RAW,
    }).spread((datas, metadata) => {
      return resolve(datas);
    });
  });
}
/**
 * 発表数取得用関数
 * @req {*} req
 * @shoriId {*} 処理ID
 */
function countHappyoSu(req, shoriId) {
  return new Promise((resolve, reject) => {
    var tShainPk = req.body.tShainPk;
    if (req.body.kengenCd == "1" || req.body.kengenCd == "0") {
      tShainPk = req.body.target_manager;
      if (tShainPk === "") {
        tShainPk = 0;
      }
    }
    if (shoriId == 0) {
      var sql =
        countHappyoSuSql +
        "and TO_NUMBER(to_char(tpre.insert_tm,'yyyy'), '9999') = 0";
      db.query(sql, {
        replacements: {
          mypk: tShainPk,
        },
        type: db.QueryTypes.RAW,
      }).spread((datas, metadata) => {
        console.log(datas);
        return resolve(datas);
      });
    } else {
      var nendo = req.body.year_info;
      if (nendo != "") {
        var sql =
          countHappyoSuSql +
          "and case when (TO_NUMBER(to_char(tpre.insert_tm,'mm'), '99') < 4) then TO_NUMBER(to_char(tpre.insert_tm,'yyyy'), '9999') - 1 else TO_NUMBER(to_char(tpre.insert_tm,'yyyy'), '9999') end = :nendo";
        db.query(sql, {
          replacements: {
            mypk: tShainPk,
            nendo: req.body.year_info,
          },
          type: db.QueryTypes.RAW,
        }).spread((datas, metadata) => {
          return resolve(datas);
        });
      } else {
        var sql = countHappyoSuSql;
        db.query(sql, {
          replacements: {
            mypk: tShainPk,
          },
          type: db.QueryTypes.RAW,
        }).spread((datas, metadata) => {
          return resolve(datas);
        });
      }
    }
  });
}

/**
 * 年度情報取得用関数
 * @req {*} req
 */
function findNendo(req) {
  return new Promise((resolve, reject) => {
    var sql =
      "select to_char(tzo.insert_tm,'yyyyMM') as year" +
      " from t_zoyo tzo" +
      " where tzo.delete_flg = '0'" +
      " group by to_char(tzo.insert_tm,'yyyyMM') order by year desc";
    db.query(sql, {
      type: db.QueryTypes.RAW,
    }).spread((datas, metadata) => {
      var y = [];
      for (var i in datas) {
        y.push(getNendo(datas[i].year + "01"));
      }
      var res = y.filter(function (x, i, self) {
        return self.indexOf(x) === i;
      });
      return resolve(res);
    });
  });
}

function getNendo(val) {
  var result = "日付文字列が不正です。"; //日付不正時のメッセージ
  try {
    var y = Number(val.substr(0, 4));
    var m = Number(val.substr(4, 2));
    var d = Number(val.substr(6, 2));
    var dt = new Date(y, m - 1, d);
    if (dt.getFullYear() == y && dt.getMonth() == m - 1 && dt.getDate() == d) {
      if (m < 4) {
        //4月はじまり
        result = y - 1;
      } else {
        result = y;
      }
    }
    return result;
  } catch (ex) {
    return result;
  }
}

/**
 * BCコイン取得用関数
 * @param {*} param
 */
function bccoinget(param) {
  return new Promise((resolve, reject) => {
    request
      .post(bcdomain + "/bc-api/get_transaction")
      .send(param)
      .end((err, res) => {
        // console.log('★★★')
        if (err) {
          // console.log('★' + err)
          return;
        }
        // console.log('★★★' + res.body.coin)
        return resolve(res.body.coin);
      });
  });
}

module.exports = router;
