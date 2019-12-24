const request = require('superagent')
const express = require('express')
const router = express.Router()
const async = require('async')
var db = require('./common/sequelize_helper.js').sequelize
var db2 = require('./common/sequelize_helper.js')
const bcdomain = require('./common/constans.js').bcdomain

// ----- コインチェッカー -----
/**
 * API : findList
 * 社員リストを取得
 */
router.post('/findList', (req, res) => {
  console.log('API : findList - start')
  findList(req, res)
  console.log('API : findList - end')
})

// ----------------------------------------------------------------------
// ----- コインチェッカー -----
/**
 * 社員リストを取得
 * @param req リクエスト
 * @param res レスポンス
 */
async function findList(req, res) {
  var resdatas = await selectEmployeeList(db, req)
  for (var i = 0; i < resdatas.length; i++) {
    const coin = await bcGetCoin(resdatas[i].bc_account)
    resdatas[i].coin = coin
  }
  console.log("resdatas:", resdatas)
  res.json({
    status: true,
    data: resdatas
  })
}

// ----------------------------------------------------------------------
// ----- コインチェッカー -----
/**
 * 社員テーブルよりselect（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
function selectEmployeeList(db, req) {
  return new Promise((resolve, reject) => {
    // SQLとパラメータを指定
    var sql =
      "select *" +
      " from t_shain" +
      " order by t_shain_pk"
    db.query(sql, {
      type: db.QueryTypes.RAW
    })
      .spread((datas, metadata) => {
        console.log('DBAccess : selectEmployeeList result...')
        return resolve(datas)
      })
  })
}

/**
 * BCコイン取得関数
 * @param account アカウント
 */
function bcGetCoin(account) {
  return new Promise((resolve, reject) => {
    var param = {
      account: account
    }
    console.log('bcrequest.param:', param)
    request
      .post(bcdomain + '/bc-api/get_coin')
      .send(param)
      .end((err, res) => {
        if (err) {
          console.log('bcrequest.err:', err)
          return
        }
        // 検索結果表示
        console.log('bcrequest.result.coin:', res.body.coin)
        return resolve(res.body.coin)
      })
  })
}

module.exports = router