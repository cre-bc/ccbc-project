const request = require('superagent')
const express = require('express')
const router = express.Router()
const async = require('async')
var db = require('./common/sequelize_helper.js').sequelize
var db2 = require('./common/sequelize_helper.js')
const bcdomain = require('./common/constans.js').bcdomain

/**
 * チャットコイン_初期表示
 */
router.post('/find', (req, res) => {
  console.log('OK')
  console.log(req.params)
  findData(req, res)
})

/**
 * チャットコイン_DB登録
 */
router.post('/create', (req, res) => {
  console.log('◆◆◆')
  if (req.body.db_name != null && req.body.db_name != '') {
    db = db2.sequelize3(req.body.db_name)
  } else {
    db = require('./common/sequelize_helper.js').sequelize
  }
  db
    .transaction(async function(tx) {
      // チャットテーブルinsert
      var t_chat_pk = await insertChat(tx, req)
      console.log(req.body.fromShainPk)
      // チャット既読テーブル更新
      await updateChatKidoku(
        tx,
        req,
        t_chat_pk,
        req.body.loginShainPk,
        req.body.fromShainPk
      )

      var t_coin_ido_pk = await tCoinIdoInsert(tx, req)
      var transaction_id = await bcrequest(req)
      await tCoinIdoUpdate(tx, transaction_id, req, t_coin_ido_pk)
      res.json({ status: true })
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
 * データ取得用関数
 *
 * @param {*} req
 * @param {*} res
 */
async function findData(req, res) {
  console.log('★findData★')
  var resdatas = []
  var bccoin = 0

  // BCアカウントを取得
  resdatas = await bcAccountGet(req)
  param = {
    account: resdatas[0].bc_account,
    bc_addr: req.body.bc_addr
  }

  // BCコイン数を取得
  bccoin = await bccoinget(param)

  res.json({
    status: true,
    data: resdatas,
    bccoin: bccoin,
    from_bcaccount: resdatas[0].from_bc_account
  })
}

/**
 * BCアカウント取得用関数
 *
 * @param {*} req
 */
async function bcAccountGet(req) {
  return new Promise((resolve, reject) => {
    console.log('★ start bcAccountGet★')
    var sql =
      'select tsha.bc_account as bc_account' +
      ' from t_shain tsha' +
      " where tsha.delete_flg = '0' and tsha.t_shain_pk = :myPk"
    if (req.body.db_name != null && req.body.db_name != '') {
      db = db2.sequelize3(req.body.db_name)
    } else {
      db = require('./common/sequelize_helper.js').sequelize
    }
    db
      .query(sql, {
        replacements: {
          myPk: req.body.loginShainPk
        },
        type: db.QueryTypes.RAW
      })
      .spread(async (datas, metadata) => {
        console.log('★End bcAccountGet')
        return resolve(datas)
      })
  })
}

/**
 * BCコイン取得用関数
 * @param {*} param
 */
function bccoinget(param) {
  return new Promise((resolve, reject) => {
    console.log('★start bccoinget★')
    request
      .post(bcdomain + '/bc-api/get_coin')
      .send(param)
      .end((err, res) => {
        console.log('★★★')
        if (err) {
          console.log('★' + err)
          return
        }
        console.log('★★★' + res.body.coin)
        return resolve(res.body.coin)
      })
    console.log('★end bccoinget★')
  })
}

/**
 * チャット既読取得用関数
 *
 * @param {*} req
 */
async function chatKidokuGet(req, fromShainPk, toShainPk) {
  return new Promise((resolve, reject) => {
    console.log('★ start chatKidokuGet')
    var sql =
      'select k.t_chat_pk as kidoku_pk from t_chat_kidoku k where k.from_shain_pk = :fromPk and k.t_shain_pk = :myPk '
    if (req.body.db_name != null && req.body.db_name != '') {
      db = db2.sequelize3(req.body.db_name)
    } else {
      db = require('./common/sequelize_helper.js').sequelize
    }
    db
      .query(sql, {
        replacements: {
          myPk: toShainPk,
          fromPk: fromShainPk
        },
        type: db.QueryTypes.RAW
      })
      .spread(async (datas, metadata) => {
        console.log('★End chatKidokuGet')
        return resolve(datas)
      })
  })
}

/**
 * チャットPK取得用関数
 *
 * @param {*} req
 */
async function chatPkGet(req) {
  return new Promise((resolve, reject) => {
    console.log('★ start chatPkGet')
    var sql =
      'select max(c.t_chat_pk) from t_chat c where c.from_shain_pk = :fromPk and c.to_shain_pk = :myPk'
    if (req.body.db_name != null && req.body.db_name != '') {
      db = db2.sequelize3(req.body.db_name)
    } else {
      db = require('./common/sequelize_helper.js').sequelize
    }
    db
      .query(sql, {
        replacements: {
          myPk: req.body.loginShainPk,
          fromPk: req.body.fromShainPk
        },
        type: db.QueryTypes.RAW
      })
      .spread(async (datas, metadata) => {
        console.log('★End chatPkGet')
        return resolve(datas)
      })
  })
}

/**
 * チャット既読テーブル更新用関数
 * @param {*} tx
 * @param {*} req
 * @param {*} maxChatPk
 * @param {*} fromShainPk
 * @param {*} toShainPk
 */
async function updateChatKidoku(tx, req, maxChatPk, fromShainPk, toShainPk) {
  return new Promise((resolve, reject) => {
    console.log('★ start updateChatKidoku★')
    var sql =
      'update t_chat_kidoku set t_chat_pk = :chatPk, update_user_id = :userId, update_tm = current_timestamp where from_shain_pk = :fromPk and t_shain_pk = :myPk'
    if (req.body.db_name != null && req.body.db_name != '') {
      db = db2.sequelize3(req.body.db_name)
    } else {
      db = require('./common/sequelize_helper.js').sequelize
    }
    db
      .query(sql, {
        transaction: tx,
        replacements: {
          chatPk: maxChatPk,
          myPk: toShainPk,
          fromPk: fromShainPk,
          userId: req.body.userid
        },
        type: db.QueryTypes.RAW
      })
      .spread(async (datas, metadata) => {
        console.log('★End updateChatKidoku★')
        return resolve(datas)
      })
  })
}

// /**
//  * チャット既読テーブルinsert用関数
//  * @param {*} tx
//  * @param {*} req
//  */
// function insertChatKidoku(req, userid, fromShainPk, toShainPk) {
//   return new Promise((resolve, reject) => {
//     var sql =
//       'insert into t_chat_kidoku (t_shain_pk, from_shain_pk, t_chat_pk, insert_user_id, insert_tm, update_user_id, update_tm) ' +
//       'VALUES (?, ?, ?, ?, current_timestamp, ?, ?) '
//     if (req.body.db_name != null && req.body.db_name != '') {
//       db = db2.sequelize3(req.body.db_name)
//     } else {
//       db = require('./common/sequelize_helper.js').sequelize
//     }

//     db
//       .query(sql, {
//         replacements: [toShainPk, fromShainPk, 0, userid, null, null]
//       })
//       .spread((datas, metadata) => {
//         console.log(datas)
//         return resolve(datas)
//       })
//   })
// }

/**
 * t_chatテーブルのinsert用関数
 * @param {*} tx
 * @param {*} req
 */
function insertChat(tx, req) {
  return new Promise((resolve, reject) => {
    console.log('★ start insertChat')
    var sql =
      'insert into t_chat (from_shain_pk, to_shain_pk, comment, post_dt, post_tm, t_coin_ido_pk, delete_flg, insert_user_id, insert_tm, update_user_id, update_tm) ' +
      'VALUES (?, ?, ?, current_timestamp, current_timestamp, ?, ?, ?, current_timestamp, ?, ?) RETURNING t_chat_pk'
    if (req.body.db_name != null && req.body.db_name != '') {
      db = db2.sequelize3(req.body.db_name)
    } else {
      db = require('./common/sequelize_helper.js').sequelize
    }

    db
      .query(sql, {
        transaction: tx,
        replacements: [
          req.body.loginShainPk,
          req.body.fromShainPk,
          req.body.comment,
          0,
          0,
          req.body.userid,
          null,
          null
        ]
      })
      .spread((datas, metadata) => {
        console.log(datas)
        return resolve(datas[0].t_chat_pk)
      })
    console.log('★ end insertChat')
  })
}

/**
 * t_coin_idoテーブルのinsert用関数
 * @param {*} tx
 * @param {*} req
 */
function tCoinIdoInsert(tx, req) {
  return new Promise((resolve, reject) => {
    var sql =
      'insert into t_coin_ido (from_shain_pk, to_shain_pk, coin, comment, delete_flg, insert_user_id, insert_tm) ' +
      'VALUES (?, ?, ?, ?, ?, ?, current_timestamp) RETURNING t_coin_ido_pk'
    if (req.body.db_name != null && req.body.db_name != '') {
      db = db2.sequelize3(req.body.db_name)
    } else {
      db = require('./common/sequelize_helper.js').sequelize
    }
    db
      .query(sql, {
        transaction: tx,
        replacements: [
          req.body.loginShainPk,
          req.body.fromShainPk,
          req.body.sofuCoin,
          req.body.comment,
          '0',
          req.body.userid
        ]
      })
      .spread((datas, metadata) => {
        console.log(datas)
        // resdatas.push(datas)
        return resolve(datas[0].t_chat_pk)
      })
  })
}

/**
 * BCコイン送金用関数
 * @param {*} req
 */
function bcrequest(req) {
  return new Promise((resolve, reject) => {
    var param = {
      from_account: [req.body.from_bcaccount],
      to_account: [req.body.to_bcaccount],
      password: [req.body.password],
      coin: [req.body.zoyoCoin],
      bc_addr: req.body.bc_addr
    }
    console.log('★★★')
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
        console.log('★★★' + res.body.transaction)
        return resolve(res.body.transaction[0])
      })
  })
}

/**
 * t_coin_idoテーブルのupdate用関数
 * @param {*} tx
 * @param {*} transaction_id
 * @param {*} req
 */
function tCoinIdoUpdate(tx, transaction_id, req, t_coin_ido_pk) {
  return new Promise((resolve, reject) => {
    var sql =
      'update t_coin_ido set transaction_id = ? where t_coin_ido_pk = ? and transaction_id is null'
    if (req.body.db_name != null && req.body.db_name != '') {
      db = db2.sequelize3(req.body.db_name)
    } else {
      db = require('./common/sequelize_helper.js').sequelize
    }
    db
      .query(sql, {
        transaction: tx,
        replacements: [transaction_id, t_coin_ido_pk]
      })
      .spread((datas, metadata) => {
        console.log(datas)
        return resolve(datas)
      })
  })
}
module.exports = router
