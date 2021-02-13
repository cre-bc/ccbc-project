const request = require('superagent')
const express = require('express')
const router = express.Router()
const async = require('async')
var db = require('./common/sequelize_helper.js').sequelize
var db2 = require('./common/sequelize_helper.js')
const bcdomain = require('./common/constans.js').bcdomain

const commonSql = "select tzoyo.zoyo_moto_shain_pk" +
  " , tsha1.shimei AS shimei_moto" +
  " , tsha1.shimei_kana AS shimei_kana_moto" +
  " , tzoyo.zoyo_saki_shain_pk" +
  " , tsha2.shimei AS shimei_saki" +
  " , tsha2.shimei_kana AS shimei_kana_saki" +
  " , tzoyo.zoyo_comment AS event" +
  " , tzoyo.transaction_id" +
  " , tzoyo.nenji_flg" +
  " , tzoyo.insert_tm" +
  " , tsha1.t_shain_pk as t_shain_pk" +
  " , tsha1.bc_account as bc_account" +
  " , tsha1.kengen_cd as kengen_cd" +
  " from t_zoyo tzoyo" +
  " left join t_shain tsha1" +
  " on tsha1.t_shain_pk = tzoyo.zoyo_moto_shain_pk" +
  " left join t_shain tsha2" +
  " on tsha2.t_shain_pk = tzoyo.zoyo_saki_shain_pk"

router.post('/find', (req, res) => {
  finddata(req, res)
  console.log('end')
})

router.post('/findChange', (req, res) => {
  console.log('findChange実行')
  finddataChange(req, res)
  console.log('end')
})

/**
 * 初期表示データ取得用関数
 * @req {*} req
 * @res {*} res
 */
async function finddata(req, res) {
  var getCoinDatas = []
  var shainDatas = []
  var nendoDatas = []
  shainDatas = await findTShain(req)
  nendoDatas = await findNendo(req)

  res.json({
    status: true,
    getCoinDatas: getCoinDatas,
    shainDatas: shainDatas,
    nendoDatas: nendoDatas
  })
}

/**
 * データ取得用関数（検索条件変更）
 * @req {*} req
 * @res {*} res
 */
async function finddataChange(req, res) {
  var getCoinDatas = []

  getCoinDatas = await findGetCoin(req)

  var trans = []
  for (var x in getCoinDatas) {
    trans.push(getCoinDatas[x].transaction_id)
  }

  var param = {
    transaction: trans
  }
  var resAll = await bccoinget(param)
  var getCoinDatasLength = getCoinDatas.length
  for (var i in resAll.body.trans) {
    if (getCoinDatasLength != '0') {
      getCoinDatas[i].coin = resAll.body.trans[i].coin
    }
  }
  res.json({
    status: true,
    getCoinDatas: getCoinDatas
  })
}

/**
 * 獲得コイン情報取得用関数
 * @req {*} req
 */
function findGetCoin(req) {
  return new Promise((resolve, reject) => {
    console.log('社員PK:' + req.body.tShainPk)
    console.log('年度:' + req.body.year)
    console.log('開始日:' + req.body.date_start)
    console.log('終了日:' + req.body.date_end)
    console.log('操作者:' + req.body.operator)
    console.log('取引相手:' + req.body.trading_partner)
    console.log('取引種類:' + req.body.trading_type)
    console.log('アクション:' + req.body.event_type)
    if (req.body.db_name != null && req.body.db_name != '') {
      db = db2.sequelize3(req.body.db_name)
    } else {
      db = require('./common/sequelize_helper.js').sequelize
    }

    console.log('検索処理実行')

    var nendo = req.body.year
    var manager = req.body.operator
    var partner = req.body.trading_partner
    var nendoStart = nendo + '/04/01'
    var nendoEnd = parseInt(nendo) + 1
    nendoEnd = nendoEnd + '/03/31'
    var dateStart = req.body.date_start
    var dateEnd = req.body.date_end
    var tradingType = req.body.trading_type
    var eventType = req.body.event_type

    var sqlWhereEvent = "";
    var sqlWhereDate = "";
    var sqlWhereTrade = "";

    // 条件：日付
    if (req.body.selectedValue == 'a') {
      // 年度
      sqlWhereDate = " and to_char(tzoyo.insert_tm,'yyyy/mm/dd') >= :nendoStart" +
                     " and :nendoEnd >= to_char(tzoyo.insert_tm, 'yyyy/mm/dd')";
    } else {
      // 日付範囲
      sqlWhereDate = " and to_char(tzoyo.insert_tm,'yyyy-mm-dd') >= :dateStart" +
                     " and :dateEnd >= to_char(tzoyo.insert_tm, 'yyyy-mm-dd')";
    }

    // 条件：取引種類
    if (tradingType == "trade1") {
      // もらう
      sqlWhereTrade = " and tsha2.t_shain_pk = :maneger" +
                      (partner == "-1" ? "" : " and tsha1.t_shain_pk = :partner");
    } else if (tradingType == "trade2") {
      // あげる
      sqlWhereTrade = " and tsha1.t_shain_pk = :maneger" +
                      (partner == "-1" ? "" : " and tsha2.t_shain_pk = :partner");
    } else if (tradingType == "trade3") {
      // 両方
      sqlWhereTrade = " and ((tsha1.t_shain_pk = :maneger " + (partner == "-1" ? "" : " and tsha2.t_shain_pk = :partner") + ")" + 
                        " or (tsha2.t_shain_pk = :maneger " + (partner == "-1" ? "" : " and tsha1.t_shain_pk = :partner") + "))";
    }

    // 条件：アクション
    if (eventType == '1') {
      // 全て
      sqlWhereEvent = " and tzoyo.nenji_flg in ('2','3','4')";
    } else {
      sqlWhereEvent = " and tzoyo.nenji_flg = :eventType";
    }

    var sql = commonSql +
            " where tzoyo.delete_flg = '0'" +
            sqlWhereDate +
            sqlWhereTrade +
            sqlWhereEvent +
            " order by tzoyo.insert_tm desc;";
    db
      .query(sql, {
        replacements: {
          nendoStart: nendoStart,
          nendoEnd: nendoEnd,
          dateStart: dateStart,
          dateEnd: dateEnd,
          maneger: manager,
          partner: partner,
          eventType: eventType
        },
        type: db.QueryTypes.RAW
      })
      .spread((datas, metadata) => {
        return resolve(datas)
      })
  })
}

/**
 * 社員情報取得用関数
 * @req {*} req
 */
function findTShain(req) {
  return new Promise((resolve, reject) => {
    if (req.body.db_name != null && req.body.db_name != '') {
      db = db2.sequelize3(req.body.db_name)
    } else {
      db = require('./common/sequelize_helper.js').sequelize
    }
    var sql =
      "select row_number() over () as id, tsha.t_shain_pk as t_shain_pk, tsha.shimei as shimei, tsha.bc_account as bc_account" +
      " from t_shain tsha" +
      " where tsha.delete_flg = '0' " +
      " order by convert_to(tsha.shimei_kana,'UTF8') "
    db
      .query(sql, {
        type: db.QueryTypes.RAW
      })
      .spread((datas, metadata) => {
        return resolve(datas)
      })
  })
}

/**
 * 年度情報取得用関数
 * @req {*} req
 */
function findNendo(req) {
  return new Promise((resolve, reject) => {
    if (req.body.db_name != null && req.body.db_name != '') {
      db = db2.sequelize3(req.body.db_name)
    } else {
      db = require('./common/sequelize_helper.js').sequelize
    }
    var sql =
      "select to_char(tzo.insert_tm,'yyyyMM') as year" +
      " from t_zoyo tzo" +
      " where tzo.delete_flg = '0'" +
      " group by to_char(tzo.insert_tm,'yyyyMM') order by year desc"
    db
      .query(sql, {
        type: db.QueryTypes.RAW
      })
      .spread((datas, metadata) => {
        var y = []
        for (var i in datas) {
          y.push(getNendo(datas[i].year + '01'))
        }
        var res = y.filter(function (x, i, self) {
          return self.indexOf(x) === i
        })
        return resolve(res)
      })
  })
}

function getNendo(val) {
  var result = '日付文字列が不正です。' //日付不正時のメッセージ
  try {
    var y = Number(val.substr(0, 4))
    var m = Number(val.substr(4, 2))
    var d = Number(val.substr(6, 2))
    var dt = new Date(y, m - 1, d)
    if (dt.getFullYear() == y && dt.getMonth() == m - 1 && dt.getDate() == d) {
      if (m < 4) {
        //4月はじまり
        result = y - 1
      } else {
        result = y
      }
    }
    return result
  } catch (ex) {
    return result
  }
}

/**
 * BCコイン取得用関数
 * @param {*} param
 */
function bccoinget(param) {
  return new Promise((resolve, reject) => {
    request
      .post(bcdomain + '/bc-api/get_transactions')
      .send(param)
      .end((err, res) => {
        // console.log('★★★')
        if (err) {
          // console.log('★' + err)
          reject(err)
        }
        // console.log('★★★' + res.body.coin)
        return resolve(res)
      })
  })
}

module.exports = router
