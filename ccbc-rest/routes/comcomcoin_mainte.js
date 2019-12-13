const express = require('express')
const router = express.Router()
const async = require('async')
var db = require('./common/sequelize_helper.js').sequelize
var db2 = require('./common/sequelize_helper.js')

var multer = require('multer')
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/advertise')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({ storage: storage })

// ----- 広告 -----
/**
 * API : findAdvertionList
 * 広告リストを取得
 */
router.post('/findAdvertionList', (req, res) => {
  console.log('API : findAdvertionList - start')
  findAdvertionList(req, res)
  console.log('API : findAdvertionList - end')
})

/**
 * API : editAdvertion
 * 広告を登録および更新
 */
router.post('/editAdvertion', upload.fields([{ name: 'imageData' }]), (req, res) => {
  console.log('API : editAdvertion - start')
  editAdvertion(req, res)
  console.log('API : editAdvertion - end')
})

/**
 * API : deleteAdvertion
 * 広告を削除
 */
router.post('/deleteAdvertion', (req, res) => {
  console.log('API : deleteAdvertion - start')
  deleteAdvertion(req, res)
  console.log('API : deleteAdvertion - end')
})

// ----- お知らせ -----
/**
 * API : findInformationList
 * お知らせリストを取得
 */
router.post('/findInformationList', (req, res) => {
  console.log('API : findInformationList - start')
  findInformationList(req, res)
  console.log('API : findInformationList - end')
})

/**
 * API : editInformation
 * お知らせを登録および更新
 */
router.post('/editInformation', (req, res) => {
  console.log('API : editInformation - start')
  editInformation(req, res)
  console.log('API : editInformation - end')
})

/**
 * API : deleteInformation
 * お知らせを削除
 */
router.post('/deleteInformation', (req, res) => {
  console.log('API : deleteInformation - start')
  deleteInformation(req, res)
  console.log('API : deleteInformation - end')
})

// ----------------------------------------------------------------------
// ----- 広告 -----
/**
 * 広告リストを取得
 * @param req リクエスト
 * @param res レスポンス
 */
async function findAdvertionList(req, res) {
  db = db2.sequelizeDB(db, req)
  var resdatas = await selectAdvertionList(req)
  res.json({
    status: true,
    data: resdatas
  })
}

/**
 * 広告を登録（新規登録も更新も）
 * @param req リクエスト
 * @param res レスポンス
 */
async function editAdvertion(req, res) {
  db = db2.sequelizeDB(req)

  db.transaction(async function (tx) {
    await insertOrUpdateKokoku(db, tx, req)
  })
    .then(result => {
      // コミットしたらこっち
      console.log('正常')
      res.json({ status: true })
    })
    .catch(e => {
      // ロールバックしたらこっち
      console.log('異常')
      console.log(e)
      res.json({ status: false })
    })
}

/**
 * 広告を削除
 * @param req リクエスト
 * @param res レスポンス
 */
async function deleteAdvertion(req, res) {
  db = db2.sequelizeDB(req)

  db.transaction(async function (tx) {
    await deleteKokoku(db, tx, req, req.body.isForce)
  })
    .then(result => {
      // コミットしたらこっち
      console.log('正常')
      res.json({ status: true })
    })
    .catch(e => {
      // ロールバックしたらこっち
      console.log('異常')
      console.log(e)
      res.json({ status: false })
    })
}

// ----- お知らせ -----
/**
 * お知らせリストを取得
 * @param req リクエスト
 * @param res レスポンス
 */
async function findInformationList(req, res) {
  db = db2.sequelizeDB(db, req)
  var resdatas = await selectOshirase(req)
  res.json({
    status: true,
    data: resdatas
  })
}

/**
 * お知らせを登録（新規登録も更新も）
 * @param req リクエスト
 * @param res レスポンス
 */
async function editInformation(req, res) {
  db = db2.sequelizeDB(req)

  db.transaction(async function (tx) {
    await insertOrUpdateOshirase(db, tx, req)
  })
    .then(result => {
      // コミットしたらこっち
      console.log('正常')
      res.json({ status: true })
    })
    .catch(e => {
      // ロールバックしたらこっち
      console.log('異常')
      console.log(e)
      res.json({ status: false })
    })
}

/**
 * お知らせを削除
 * @param req リクエスト
 * @param res レスポンス
 */
async function deleteInformation(req, res) {
  db = db2.sequelizeDB(req)

  db.transaction(async function (tx) {
    await deleteOshirase(db, tx, req, req.body.isForce)
  })
    .then(result => {
      // コミットしたらこっち
      console.log('正常')
      res.json({ status: true })
    })
    .catch(e => {
      // ロールバックしたらこっち
      console.log('異常')
      console.log(e)
      res.json({ status: false })
    })
}

// ----------------------------------------------------------------------
// ----- 広告 -----
/**
 * 広告テーブルよりselect（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
function selectAdvertionList(db, req) {
  return new Promise((resolve, reject) => {
    // SQLとパラメータを指定
    var sql =
      "select *" +
      " from t_kokoku" +
      " order by renban"
    db.query(sql, {
      type: db.QueryTypes.RAW
    })
      .spread((datas, metadata) => {
        console.log('DBAccess : selectAdvertionList result...')
        return resolve(datas)
      })
  })
}

/**
 * 広告テーブルのinsert or update（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param tx トランザクション
 * @param req リクエスト
 */
function insertOrUpdateKokoku(db, tx, req) {
  return new Promise((resolve, reject) => {
    // SQLとパラメータを指定
    var sql = ""
    if (req.body.renban != null && req.body.renban != "") {
      sql =
        "update t_kokoku set" +
        " file_path = :file_path, comment = :comment," +
        " update_user_id = :user_id, update_tm = current_timestamp" +
        " where renban = :renban"
    } else {
      sql =
        "insert into t_kokoku (file_path, comment, delete_flg, insert_user_id, insert_tm, update_user_id, update_tm)" +
        " values (:file_path, :comment, '0', :user_id, current_timestamp, :user_id, current_timestamp) "
    }
    db.query(sql, {
      transaction: tx,
      replacements: {
        renban: req.body.renban,
        file_path: req.body.file_path,
        comment: req.body.comment,
        user_id: 0
      }
    })
      .spread((datas, metadata) => {
        console.log('DBAccess : insertOrUpdateKokoku result...')
        console.log(datas)
        return resolve(datas)
      })
  })
}

/**
 * 広告テーブルのdelete（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param tx トランザクション
 * @param req リクエスト
 * @param isForce 物理削除の場合はtrue
 */
function deleteKokoku(db, tx, req, isForce) {
  return new Promise((resolve, reject) => {
    // SQLとパラメータを指定
    var sql = ""
    if (isForce !== "") {
      sql =
        "delete from t_kokoku" +
        " where renban = :renban"
    } else {
      sql =
        "update t_kokoku set" +
        " delete_flg = '1'," +
        " update_user_id = :user_id, update_tm = current_timestamp" +
        " where renban = :renban"
    }
    db.query(sql, {
      transaction: tx,
      replacements: {
        renban: req.body.renban,
        user_id: 0
      }
    })
      .spread((datas, metadata) => {
        console.log('DBAccess : deleteKokoku result...')
        console.log(datas)
        return resolve(datas)
      })
  })
}

// ----- お知らせ -----
/**
 * お知らせテーブルよりselect（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
function selectOshirase(db, req) {
  return new Promise((resolve, reject) => {
    // SQLとパラメータを指定
    var sql =
      "select *" +
      " from t_oshirase" +
      " order by t_oshirase_pk"
    db.query(sql, {
      type: db.QueryTypes.RAW
    })
      .spread((datas, metadata) => {
        console.log('DBAccess : selectOshirase result...')
        return resolve(datas)
      })
  })
}

/**
 * お知らせテーブルのinsert or update（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param tx トランザクション
 * @param req リクエスト
 */
function insertOrUpdateOshirase(db, tx, req) {
  return new Promise((resolve, reject) => {
    // SQLとパラメータを指定
    var sql = ""
    if (req.body.renban != null && req.body.renban != "") {
      sql =
        "update t_oshirase set" +
        " title = :title, comment = :comment, notice_dt = :notice_dt," +
        " update_user_id = :user_id, update_tm = current_timestamp" +
        " where renban = :renban"
    } else {
      sql =
        "insert into t_oshirase (title, comment, notice_dt, delete_flg, insert_user_id, insert_tm, update_user_id, update_tm)" +
        " values (:title, :comment, :notice_dt, '0', :user_id, current_timestamp, :user_id, current_timestamp) "
    }
    db.query(sql, {
      transaction: tx,
      replacements: {
        renban: req.body.renban,
        title: req.body.title,
        comment: req.body.comment,
        notice_dt: req.body.notice_dt,
        user_id: 0
      }
    })
      .spread((datas, metadata) => {
        console.log('DBAccess : insertOrUpdateOshirase result...')
        console.log(datas)
        return resolve(datas)
      })
  })
}

/**
 * お知らせテーブルのdelete（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param tx トランザクション
 * @param req リクエスト
 * @param isForce 物理削除の場合はtrue
 */
function deleteOshirase(db, tx, req, isForce) {
  return new Promise((resolve, reject) => {
    // SQLとパラメータを指定
    var sql = ""
    if (isForce !== "") {
      sql =
        "delete from t_oshirase" +
        " where renban = :renban"
    } else {
      sql =
        "update t_oshirase set" +
        " delete_flg = '1'," +
        " update_user_id = :user_id, update_tm = current_timestamp" +
        " where renban = :renban"
    }
    db.query(sql, {
      transaction: tx,
      replacements: {
        renban: req.body.renban,
        user_id: 0
      }
    })
      .spread((datas, metadata) => {
        console.log('DBAccess : deleteOshirase result...')
        console.log(datas)
        return resolve(datas)
      })
  })
}
module.exports = router