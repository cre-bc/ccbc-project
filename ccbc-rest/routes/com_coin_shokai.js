const request = require('superagent')
const express = require('express')
const router = express.Router()
const async = require('async')
var db = require('./common/sequelize_helper.js').sequelize
var db2 = require('./common/sequelize_helper.js')
const bcdomain = require('./common/constans.js').bcdomain

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
  var resdatas = [];
  var resbccoin = [];
  var sakicoin_sum = 0;

  getCoinDatas = await findGetCoin(req, 1)

  var getCoinSu = 0

  var trans = []
  for (var x in getCoinDatas) {
    trans.push(getCoinDatas[x].transaction_id)
  }

  var param = {
    transaction: trans,
    bc_addr: req.body.bc_addr
  }
  var resAll = await bccoinget(param)
  var getCoinDatasLength = getCoinDatas.length

  for (var i in resAll.body.trans) {
    if (i < getCoinDatasLength) {
      getCoinDatas[i].coin = resAll.body.trans[i].coin
      getCoinSu = getCoinSu + resAll.body.trans[i].coin
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
 * @shoriId {*} 処理ID
 */
function findGetCoin(req, shoriId) {
  return new Promise((resolve, reject) => {
    console.log('社員PK:' + req.body.tShainPk)
    console.log('処理ID:' + shoriId)
    console.log('年度:' + req.body.year)
    console.log('氏名:' + req.body.operator)
    if (req.body.db_name != null && req.body.db_name != '') {
      db = db2.sequelize3(req.body.db_name)
    } else {
      db = require('./common/sequelize_helper.js').sequelize
    }

    console.log('検索処理実行')
    // 検索条件ありの場合
    var nendo = req.body.year
    var manager = req.body.operator
    var partner = req.body.trading_partner
    var nendoStart = nendo + '/04/01'
    var nendoEnd = parseInt(nendo) + 1
    nendoEnd = nendoEnd + '/03/31'
    var sql =
      "and to_char(tzo.insert_tm,'yyyy/mm/dd') >= :nendoStart and :nendoEnd >= to_char(tzo.insert_tm, 'yyyy/mm/dd') and tsha.t_shain_pk = :maneger order by tzo.insert_tm desc"
    db
      .query(sql, {
        replacements: {
          nendoStart: nendoStart,
          nendoEnd: nendoEnd,
          maneger: manager,
          partner: partner
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
      " where tsha.delete_flg = '0' "
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
