const request = require('superagent')
const express = require('express')
const router = express.Router()
const async = require('async')
var db = require('./common/sequelize_helper.js').sequelize
var db2 = require('./common/sequelize_helper.js')
const bcdomain = require('./common/constans.js').bcdomain
const jimuAccount = require('./common/constans.js').jimuAccount
const jimuPassword = require('./common/constans.js').jimuPassword
const jimuShainPk = require('./common/constans.js').jimuShainPk

/**
 * 投票登録_DB読み込み（初期表示時）
 */
router.post('/find', (req, res) => {
  var sql =
    'select tsen.t_senkyo_pk as t_senkyo_pk, tsen.senkyo_nm as senkyo_nm, tsen.tohyo_kaishi_dt as tohyo_kaishi_dt,' +
    ' tsen.tohyo_shuryo_dt as tohyo_shuryo_dt, tsen.haifu_coin as haifu_coin, tsen.config_coin as config_coin, tpre.t_presenter_pk as t_presenter_pk, ' +
    ' tpre.title as title, tsha.t_shain_pk as t_shain_pk, tsha.shimei as shimei, tsha.image_file_nm as image_file_nm, tsha.bc_account as to_account, tsha.t_shain_pk as to_t_shain_pk, tshu.t_shussekisha_pk  as t_shussekisha_pk, tsha2.bc_account as from_account, tsha2.t_shain_pk as from_t_shain_pk' +
    ' from t_senkyo tsen' +
    ' inner join t_presenter tpre on tsen.t_senkyo_pk = tpre.t_senkyo_pk' +
    ' inner join t_shain tsha on tpre.t_shain_pk = tsha.t_shain_pk' +
    ' left join t_shussekisha tshu on tsen.t_senkyo_pk = tshu.t_senkyo_pk and tshu.t_shain_pk = :mypk' +
    ' left join t_shain tsha2 on tsha2.t_shain_pk = :mypk' +
    " where tsen.delete_flg = '0'  and tpre.delete_flg = '0' and tsha.delete_flg = '0' and tshu.delete_flg = '0' and tsha.kengen_cd <> '3' " +
    ' and exists (select 1 from t_senkyo tsen2 inner join t_shussekisha tshu2 on tsen2.t_senkyo_pk = tshu2.t_senkyo_pk' +
    " where tsen2.delete_flg = '0' and tshu2.delete_flg = '0' and tshu2.t_shain_pk = :mypk)" +
    " and not exists (select 1 from t_tohyo ttoh where ttoh.delete_flg = '0' and ttoh.t_presenter_pk = tpre.t_presenter_pk and ttoh.t_shussekisha_pk = tshu.t_shussekisha_pk and ttoh.transaction_id is not null)" +
    ' and current_date between tsen.tohyo_kaishi_dt and tsen.tohyo_shuryo_dt and tpre.t_shain_pk <> :mypk' +
    " order by convert_to(tsha.shimei_kana,'UTF8')"
  if (req.body.db_name != null && req.body.db_name != '') {
    db = db2.sequelize3(req.body.db_name)
  } else {
    db = require('./common/sequelize_helper.js').sequelize
  }
  db
    .query(sql, {
      replacements: { mypk: req.body.tShainPk },
      type: db.QueryTypes.RAW
    })
    .spread((datas, metadata) => {
      console.log('★★★')
      console.log(datas)
      res.json({ status: true, data: datas })
    })
})

/**
 * 投票登録_DB登録
 */
router.post('/create', (req, res) => {
  console.log('◆◆◆')
  var resultList = req.body.resultList
  if (req.body.db_name != null && req.body.db_name != '') {
    db = db2.sequelize3(req.body.db_name)
  } else {
    db = require('./common/sequelize_helper.js').sequelize
  }

  // トークンチェック
  var sql =
    'select token' +
    ' from t_shain tsha' +
    " where tsha.delete_flg = '0' and tsha.token = :mytoken"
  db
    .query(sql, {
      replacements: { mytoken: req.body.tokenId },
      type: db.QueryTypes.RAW
    })
    .spread(async (datas, metadata) => {
      console.log(datas)
      if (datas.length == 0) {
        console.log('トークンチェックエラー')
        res.json({ status: false })
        return
      }
    })

  db
    .transaction(async function(tx) {
      var resdatas = []
      // var haifu_coin = resultList[0].config_coin * 50 * resultList.length
      for (var i in resultList) {
        var resdata = resultList[i]
        console.log('◆１')
        var sum_coin =
          (req.body.activeStep1[i] +
            req.body.activeStep2[i] +
            req.body.activeStep3[i] +
            req.body.activeStep4[i] +
            req.body.activeStep5[i] +
            5) *
          resultList[0].config_coin
        // haifu_coin -= sum_coin

        var t_tohyo_pk = await insertTohyo(tx, resdatas, resdata, req, i)
        var transaction_id = await bcrequest(
          req,
          resdata.from_account,
          resdata.to_account,
          sum_coin
        )
        await updateTohyo(tx, t_tohyo_pk, transaction_id, req)
        await insertZoyo(
          tx,
          jimuShainPk,
          resdata.to_t_shain_pk,
          resdata.senkyo_nm,
          req.body.userid,
          transaction_id,
          req
        )
      }

      // 投票のコインの流れを修正（旧：事務局→出席者→発表者、新：事務局→発表者）
      // ※事務局から直接配布するため、余りコインの返却は発生しない
      // console.log('★事務局返却コイン：' + haifu_coin)
      // if (haifu_coin > 0) {
      //   // コイン返却
      //   var datas = await selectKanrisha(tx, req)
      //   var transaction_id = await bcrequest(
      //     req,
      //     resultList[0].from_account,
      //     datas[0].bc_account,
      //     haifu_coin
      //   )
      //   await insertZoyo(
      //     tx,
      //     resultList[0].from_t_shain_pk,
      //     datas[0].t_shain_pk,
      //     resultList[0].senkyo_nm,
      //     req.body.userid,
      //     transaction_id,
      //     req
      //   )
      // }

      res.json({ status: true, data: resdatas })
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
})

/**
 * t_tohyoテーブルのinsert用関数
 * @param {*} tx
 * @param {*} resdatas
 * @param {*} resdata
 * @param {*} req
 * @param {*} i
 */
function insertTohyo(tx, resdatas, resdata, req, i) {
  return new Promise((resolve, reject) => {
    var sql =
      'insert into t_tohyo (t_presenter_pk, t_shussekisha_pk, hyoka1, hyoka2, hyoka3, hyoka4, hyoka5, hyoka_comment, transaction_id, delete_flg, insert_user_id, insert_tm) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, current_timestamp) RETURNING t_tohyo_pk'
    if (req.body.db_name != null && req.body.db_name != '') {
      db = db2.sequelize3(req.body.db_name)
    } else {
      db = require('./common/sequelize_helper.js').sequelize
    }
    // 改行変換
    // var comment = req.body.comment[i]
    // if (comment != '' && comment != null) {
    //   comment = String(comment).replace(/\r?\n/g, '<br>')
    // }
    db
      .query(sql, {
        transaction: tx,
        replacements: [
          resdata.t_presenter_pk,
          resdata.t_shussekisha_pk,
          req.body.activeStep1[i] + 1,
          req.body.activeStep2[i] + 1,
          req.body.activeStep3[i] + 1,
          req.body.activeStep4[i] + 1,
          req.body.activeStep5[i] + 1,
          req.body.comment[i],
          null,
          '0',
          req.body.userid
        ]
      })
      .spread((datas, metadata) => {
        console.log('◆３')
        console.log(datas)
        resdatas.push(datas)
        return resolve(datas[0].t_tohyo_pk)
      })
  })
}

/**
 * BCコイン送金用関数
 * @param {*} req
 * @param {*} from
 * @param {*} to
 * @param {*} sum_coin
 */
function bcrequest(req, from, to, sum_coin) {
  return new Promise((resolve, reject) => {
    var param = {
      from_account: [jimuAccount],
      to_account: [to],
      password: [jimuPassword],
      coin: [sum_coin],
      bc_addr: req.body.bc_addr
    }
    request
      .post(bcdomain + '/bc-api/send_coin')
      .send(param)
      .end((err, res) => {
        console.log('★★★')
        if (err) {
          console.log('★' + err)
          return
        }
        // 検索結果表示
        console.log('★★★' + res)
        return resolve(res.body.transaction[0])
      })
  })
}

/**
 * t_tohyoテーブルのupdate用関数
 * @param {*} tx
 * @param {*} t_tohyo_pk
 * @param {*} transaction_id
 */
function updateTohyo(tx, t_tohyo_pk, transaction_id, req) {
  return new Promise((resolve, reject) => {
    var sql2 = 'update t_tohyo set transaction_id = ? where t_tohyo_pk = ?'
    if (req.body.db_name != null && req.body.db_name != '') {
      db = db2.sequelize3(req.body.db_name)
    } else {
      db = require('./common/sequelize_helper.js').sequelize
    }
    db
      .query(sql2, {
        transaction: tx,
        replacements: [transaction_id, t_tohyo_pk]
      })
      .spread((datas, metadata) => {
        console.log(datas)
        return resolve(datas)
      })
  })
}

function insertZoyo(
  tx,
  moto_pk,
  saki_pk,
  zoyo_comment,
  userid,
  transaction_id,
  req
) {
  return new Promise((resolve, reject) => {
    var sql =
      'insert into t_zoyo (zoyo_moto_shain_pk, zoyo_saki_shain_pk, zoyo_comment, transaction_id, delete_flg, insert_user_id, insert_tm, nenji_flg) ' +
      "VALUES (?, ?, ?, ?, ?, ?, current_timestamp, '0') RETURNING t_zoyo_pk"
    if (req.body.db_name != null && req.body.db_name != '') {
      db = db2.sequelize3(req.body.db_name)
    } else {
      db = require('./common/sequelize_helper.js').sequelize
    }
    db
      .query(sql, {
        transaction: tx,
        replacements: [
          moto_pk,
          saki_pk,
          zoyo_comment,
          transaction_id,
          '0',
          userid
        ]
      })
      .spread((datas, metadata) => {
        console.log(datas)
        return resolve(datas[0].t_zoyo_pk)
      })
  })
}

function selectKanrisha(tx, req) {
  return new Promise((resolve, reject) => {
    // 管理者権限コードは0の前提
    var sql =
      "select t_shain_pk, bc_account from t_shain where delete_flg = '0' and kengen_cd = '0'"
    if (req.body.db_name != null && req.body.db_name != '') {
      db = db2.sequelize3(req.body.db_name)
    } else {
      db = require('./common/sequelize_helper.js').sequelize
    }
    db
      .query(sql, {
        transaction: tx
      })
      .spread((datas, metadata) => {
        console.log(datas)
        return resolve(datas)
      })
  })
}

module.exports = router
