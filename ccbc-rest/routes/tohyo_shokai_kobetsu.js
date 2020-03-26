const request = require('superagent')
const express = require('express')
const router = express.Router()
const async = require('async')
var db = require('./common/sequelize_helper.js').sequelize
var db2 = require('./common/sequelize_helper.js')
const bcdomain = require('./common/constans.js').bcdomain

// const query = (sql, params, res) => {
//   db.query(sql, params, (err, datas) => {
//     if (err) {
//       console.log(`failed...${err}`)
//       res.status(400).send(`エラーが発生しました<br />${err}`)
//       return
//     }
//     console.log('success!!(tohyo_shokai)')
//     console.log(datas)
//     res.json({ status: true, data: datas })
//   })
// .spread(async (datas, metadata) => {
//   console.log('■■■■■■■■■■■■■■■■■■■■■')
//   var result = await bcrequest(datas)
//   res.json({ status: true, data: datas })
// })
//}

router.post('/find', (req, res) => {
  console.log('OK')
  console.log(req.params)
  findData(req, res)
})

/**
 * データ取得用関数
 *
 * @param {*} req
 * @param {*} res
 */
async function findData(req, res) {
  console.log('★★★findData★★★')

  var tPresenter = []
  var tTohyoJoho = []
  var miTohyosha = []

  // 発表者情報を取得
  tPresenter = await tPresenterGet(req, 1)
  for (var i in tPresenter) {
    // 発表者に紐づく投票情報から、獲得コイン数を取得
    if (tPresenter[i].t_presenter_pk == 'undifined') {
      sumCoin = 0
    } else {
      sumCoin = await tTohyoJohoGet(req, tPresenter[i].t_presenter_pk)
    }
    tPresenter[i].sumCoin = sumCoin
  }

  // ランキング順にソート
  tPresenter = tPresenter.sort(function(a, b) {
    return b.sumCoin - a.sumCoin
  })
  // 順位の設定（1位～3位まで）
  var topCoin = 0
  for (var i in tPresenter) {
    tPresenter[i].rank = i
    console.log('順位の設定')
    console.log(i)
    if (i === '0') {
      topCoin = tPresenter[i].sumCoin
      if (topCoin === 0) {
        tPresenter[i].bar = 0
      } else {
        tPresenter[i].bar = 100
      }
    } else {
      tPresenter[i].bar = Math.round(tPresenter[i].sumCoin / topCoin * 100)
    }
    console.log(tPresenter[i].bar)
  }

  console.log(tPresenter)

  // 未投票者の取得
  miTohyosha = await miTohohyoshaGet(req)
  console.log(miTohyosha)
  res.json({ status: true, data: tPresenter, data2: miTohyosha })

  console.log('★★★★★★★★★★★★★★★★')
  console.log(req.params)

  // if (result == true) {
  //   console.log('----------')
  //   console.log(datas[0].t_senkyo_pk)
  //   console.log(datas[0].t_presenter_pk)
  //   console.log(datas[0].title)
  //   console.log(datas[0].transaction_id)
  //   console.log(datas[0].sumCoin)
  //   console.log('----------')
  //   res.json({ status: true, data: datas })
  // } else {
  //   res.json({ status: false })
  // }
}

/**
 * 発表者取得用関数
 *
 * @param {*} req
 */
async function tPresenterGet(req) {
  return new Promise((resolve, reject) => {
    console.log('★★★tPresenterGet★★★')
    // 選挙PKはパラメータで前画面より取得する
    var sql =
      "select t1.t_senkyo_pk, t2.t_presenter_pk, t2.title, t3.shimei, t3.image_file_nm from t_senkyo t1 inner join t_presenter t2 on  t1.t_senkyo_pk = t2.t_senkyo_pk inner join t_shain t3 on  t2.t_shain_pk = t3.t_shain_pk where t1.t_senkyo_pk = :tSenkyoPk and t1.delete_flg = '0' and t2.delete_flg = '0' and t3.delete_flg = '0' and t3.kengen_cd <> '3' order by t_presenter_pk"
    if (req.body.db_name != null && req.body.db_name != '') {
      db = db2.sequelize3(req.body.db_name)
    } else {
      db = require('./common/sequelize_helper.js').sequelize
    }
    db
      .query(sql, {
        replacements: { tSenkyoPk: req.body.tSenkyoPk },
        type: db.QueryTypes.RAW
      })
      .spread(async (datas, metadata) => {
        console.log('★★★【End】tPresenterGet★★★')
        return resolve(datas)
      })
  })
}

/**
 * 発表者情報に紐づく投票情報を取得
 */
async function tTohyoJohoGet(req, paramTPresenterPk) {
  return new Promise((resolve, reject) => {
    console.log('★★★tTohyoJohoGet★★★')
    console.log(paramTPresenterPk)
    var sumCoin = 0
    var sql =
      "select t3.t_tohyo_pk, t3.transaction_id, t3.hyoka1 + t3.hyoka2 + t3.hyoka3 + t3.hyoka4 + t3.hyoka5 as hyoka from t_tohyo t3 where t_presenter_pk = :presenterPk and delete_flg = '0'"
    if (req.body.db_name != null && req.body.db_name != '') {
      db = db2.sequelize3(req.body.db_name)
    } else {
      db = require('./common/sequelize_helper.js').sequelize
    }
    db
      .query(sql, {
        replacements: { presenterPk: paramTPresenterPk },
        type: db.QueryTypes.RAW
      })
      .spread(async (datas, metadata) => {
        // DBからの取得結果分loopしてBCサーバから情報を取得。コイン数をサマる
        var result = await bcrequest(req, datas)
        for (var i in result.body.trans) {
          console.log('◆◆◆' + result.body.trans[i].coin)
          if (result.body.trans[i].coin > 0) {
            sumCoin += result.body.trans[i].coin
          } else {
            sumCoin += datas[i].hyoka
          }
        }

        console.log('----------')
        console.log('sumCoin:' + sumCoin)
        console.log('----------')
        console.log('★★★【End】tTohyoJohoGet★★★')
        return resolve(sumCoin)
      })
  })
}

/**
 * 未投票者取得用関数
 *
 * @param {*} req
 */
async function miTohohyoshaGet(req) {
  return new Promise((resolve, reject) => {
    console.log('★★★miTohohyoshaGet★★★')
    // 選挙PKはパラメータで前画面より取得する
    var sql =
      'select shimei from t_shain where t_shain_pk in( select t1.t_shain_pk from ' +
      '( select t1.t_senkyo_pk, t2.t_shussekisha_pk, t2.t_shain_pk, t3.t_shussekisha_pk from t_senkyo t1 inner join t_shussekisha t2 on  t1.t_senkyo_pk = t2.t_senkyo_pk left join ' +
      "( select t_shussekisha_pk from t_tohyo where delete_flg = '0' ) t3 on  t2.t_shussekisha_pk = t3.t_shussekisha_pk where t1.t_senkyo_pk = :tSenkyoPk " +
      "and t3.t_shussekisha_pk is null and t1.delete_flg = '0' and t2.delete_flg = '0' ) t1 ) order by convert_to(t_shain.shimei_kana,'UTF8')"
    if (req.body.db_name != null && req.body.db_name != '') {
      db = db2.sequelize3(req.body.db_name)
    } else {
      db = require('./common/sequelize_helper.js').sequelize
    }
    db
      .query(sql, {
        replacements: { tSenkyoPk: req.body.tSenkyoPk },
        type: db.QueryTypes.RAW
      })
      .spread(async (datas, metadata) => {
        console.log('----------')
        console.log(datas)
        console.log('----------')
        console.log('★★★【End】miTohohyoshaGet★★★')
        return resolve(datas)
      })
  })
}

/**
 * @param {*} resdata
 */
function bcrequest(req, data) {
  return new Promise((resolve, reject) => {
    var transactions = []
    for (var i in data) {
      transactions.push(data[i].transaction_id)
    }
    var param = {
      transaction: transactions,
      bc_addr: req.body.bc_addr
    }

    request
      .post(bcdomain + '/bc-api/get_transactions')
      .send(param)
      .end((err, res) => {
        // console.log('◆３')
        // console.log('★★★')

        if (err) {
          // console.log('★' + err)
          return
        }
        // 検索結果表示
        // console.log('★★★res:' + res.body.coin)
        return resolve(res)
      })
  })
}

module.exports = router
