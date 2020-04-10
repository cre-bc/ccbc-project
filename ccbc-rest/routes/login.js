const request = require('superagent')
const express = require('express')
const router = express.Router()
const async = require('async')
var db = require('./common/sequelize_helper.js').sequelize
var db2 = require('./common/sequelize_helper.js')
const bcdomain = require('./common/constans.js').bcdomain

router.post('/find', (req, res) => {
  // console.log('----------')
  // console.log('id:' + req.body.id)
  // console.log('db_name:' + req.body.db_name)
  // console.log('saveFlg:' + req.body.saveFlg)
  // console.log('----------')

  var sql =
    "select t_shain_pk, user_id, shimei, image_file_nm, kengen_cd, bc_account from t_shain where delete_flg = '0' and user_id = :mypk"

  if (req.body.db_name != null && req.body.db_name != '') {
    db = db2.sequelize3(req.body.db_name)
  } else {
    db = require('./common/sequelize_helper.js').sequelize
  }
  db
    .query(sql, {
      replacements: { mypk: req.body.id },
      type: db.QueryTypes.RAW
    })
    .spread(async (datas, metadata) => {
      // console.log('----------')
      // console.log(datas)
      // console.log('----------')

      // ユーザ情報が取得できない場合は終了
      if (datas == '') {
        res.json({ status: false })
        return
      }

      // console.log('----------')
      // console.log(datas[0].user_id)
      // console.log(datas[0].shimei)
      // console.log(datas[0].image_file_nm)
      // console.log(datas[0].bc_account)
      // console.log('----------')

      var result = await bcrequest(req, datas)

      // console.log('----------')
      // console.log('result:' + result)
      // console.log('----------')

      if (result == true) {
        // res.json({ status: true, data: datas })

        // 生成する文字列の長さ
        var l = 16

        // 生成する文字列に含める文字セット
        var c = 'abcdefghijklmnopqrstuvwxyz0123456789'

        var cl = c.length
        var r = ''
        for (var i = 0; i < l; i++) {
          r += c[Math.floor(Math.random() * cl)]
        }
        // console.log('----------')
        // console.log('トークン:' + r)
        // console.log('----------')
        db
          .transaction(async function (tx) {
            await tokenUpdate(tx, req, r)
            res.json({ status: true, data: datas, token: r })
          })
          .then(result => {
            // コミットしたらこっち
            console.log('正常')
          })
          .catch(e => {
            // ロールバックしたらこっち
            console.log('異常')
            console.log(e)
          })
      } else {
        res.json({ status: false })
      }
    })
})

/**
 * @param {*} req
 * @param {*} resdata
 */
function bcrequest(req, datas) {
  return new Promise((resolve, reject) => {
    var param = {
      account: datas[0].bc_account,
      password: req.body.passwordInput,
      bc_addr: req.body.bc_addr
    }

    request
      .post(bcdomain + '/bc-api/login')
      .send(param)
      .end((err, res) => {
        if (err) {
          console.log('★' + err)
          return
        }
        // 検索結果表示
        console.log('bcrequest:' + res)
        return resolve(res.body.result)
      })
  })
}

/**
 * tokenのupdate用関数
 * @param {*} tx
 * @param {*} req
 * @param {*} token
 */
function tokenUpdate(tx, req, token) {
  return new Promise((resolve, reject) => {
    var sql = ""
    var param = []
    if (req.body.expo_push_token != null && req.body.expo_push_token != "") {
      // ComComCoinからのログイン
      sql = 'update t_shain set expo_push_token = ? where user_id = ?'
      param = [req.body.expo_push_token, req.body.id]
    } else {
      // WebかHARVESTからのログイン
      sql = 'update t_shain set token = ? where user_id = ?'
      param = [token, req.body.id]
    }

    db
      .query(sql, {
        transaction: tx,
        replacements: param
      })
      .spread((datas, metadata) => {
        // console.log(datas)
        return resolve(datas)
      })
  })
}

module.exports = router
