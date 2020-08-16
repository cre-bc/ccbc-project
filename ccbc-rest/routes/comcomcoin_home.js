const express = require('express')
const router = express.Router()
const async = require('async')
var db = require('./common/sequelize_helper.js').sequelize
var db2 = require('./common/sequelize_helper.js')

/**
 * API : findHome
 * ComComCoinホーム画面に表示する全ての情報を取得
 * 頻繁に使用されるAPIであるため、性能面を考慮し、必要最低限の情報のみを返却する
 */
router.post('/findHome', (req, res) => {
  console.log('API : findHome - start')
  findHomeInfo(req, res)

  console.log('API : findHome - end')
})

/**
 * API : findHomeAdvertise
 * ComComCoinホーム広告画面に表示する情報を取得
 */
router.post('/findHomeAdvertise', (req, res) => {
  console.log('API : findHomeAdvertise - start')
  findHomeAdvertise(req, res)

  console.log('API : findHomeAdvertise - end')
})

/**
 * API : findHomeInfoList
 * ComComCoinホームお知らせ一覧画面に表示する情報を取得
 */
router.post('/findHomeInfoList', (req, res) => {
  console.log('API : findHomeInfoList - start')
  findHomeInfoList(req, res)

  console.log('API : findHomeInfoList - end')
})

/**
 * API : findHomeInformation
 * ComComCoinホームお知らせ詳細画面に表示する情報を取得
 */
router.post('/findHomeInformation', (req, res) => {
  console.log('API : findHomeInformation - start')
  findHomeInformation(req, res)

  console.log('API : findHomeInformation - end')
})

/**
 * API : findHomeArticleList
 * ComComCoinホームお知らせ一覧画面に表示する情報を取得
 */
router.post('/findHomeArticleList', (req, res) => {
  console.log('API : findHomeArticleList - start')
  findHomeArticleList(req, res)

  console.log('API : findHomeArticleList - end')
})

// ----------------------------------------------------------------------
/**
 * ComComCoinホーム画面に表示する全ての情報を取得
 * @param req リクエスト
 * @param res レスポンス
 */
async function findHomeInfo(req, res) {
  db = db2.sequelizeDB(req)

  const resdatas = { adList: [], infoList: [], newArticleList: [], popularArticleList: [], chatCnt: 0, articleCnt: 0 }

  // 広告の取得
  resdatas.adList = await getHomeKokoku(db, req)
  // お知らせの取得
  resdatas.infoList = await getHomeOshirase(db, req)
  // 最新記事の取得
  resdatas.newArticleList = await getHomeKiji(db, req, true)
  // 人気記事の取得
  resdatas.popularArticleList = await getHomeKiji(db, req, false)
  // チャットの未読件数の取得
  var resChat = await getChatMidoku(db, req)
  resdatas.chatCnt = resChat[0].chat_cnt
  // console.log("chatCnt:", resdatas.chatCnt)
  // 記事の未読件数の取得
  var resArticle = await getArticleMidoku(db, req)
  resdatas.articleCnt = resArticle[0].article_cnt
  // console.log("articleCnt:", resdatas.articleCnt)

  res.json({
    status: true,
    data: resdatas
  })
}

/**
 * ComComCoinホーム広告画面に表示する情報を取得
 * @param req リクエスト
 * @param res レスポンス
 */
async function findHomeAdvertise(req, res) {
  db = db2.sequelizeDB(req)

  // 広告の取得
  const result = await getKokoku(db, req)
  const resdatas = {
    file_path: result[0].file_path,
    comment: result[0].comment
  }

  res.json({
    status: true,
    data: resdatas
  })
}

/**
 * ComComCoinホームお知らせ一覧画面に表示する情報を取得
 * @param req リクエスト
 * @param res レスポンス
 */
async function findHomeInfoList(req, res) {
  db = db2.sequelizeDB(req)

  // お知らせ一覧の取得
  const resdatas = await getOshiraseList(db, req)

  res.json({
    status: true,
    data: resdatas
  })
}

/**
 * ComComCoinホームお知らせ詳細画面に表示する情報を取得
 * @param req リクエスト
 * @param res レスポンス
 */
async function findHomeInformation(req, res) {
  db = db2.sequelizeDB(req)

  // お知らせの取得
  const result = await getOshirase(db, req)
  const resdatas = {
    title: result[0].title,
    comment: result[0].comment,
    notice_dt: result[0].notice_dt
  }

  res.json({
    status: true,
    data: resdatas
  })
}

/**
 * ComComCoinホーム記事一覧画面に表示する情報を取得
 * @param req リクエスト
 * @param res レスポンス
 */
async function findHomeArticleList(req, res) {
  db = db2.sequelizeDB(req)

  // 記事一覧の取得
  const resdatas = await getKijiList(db, req, req.body.mode)

  res.json({
    status: true,
    data: resdatas
  })
}

// ----------------------------------------------------------------------
/**
 * ホーム画面に表示する広告情報を取得（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
function getHomeKokoku(db, req) {
  return new Promise((resolve, reject) => {
    var sql =
      "select renban, file_path" +
      " from t_kokoku" +
      " where delete_flg = '0'" +
      " order by renban"
    db.query(sql, {
      type: db.QueryTypes.RAW
    })
      .spread((datas, metadata) => {
        console.log('DBAccess : getHomeKokoku result...')
        // console.log(datas)
        return resolve(datas)
      })
  })
}

/**
 * ホーム画面に表示するお知らせ情報（最新の3件）を取得（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
function getHomeOshirase(db, req) {
  return new Promise((resolve, reject) => {
    // 最新の3件を取得
    var sql =
      "select renban, notice_dt, title" +
      " from t_oshirase" +
      " where delete_flg = '0'" +
      " order by notice_dt desc" +
      " limit 3"
    db.query(sql, {
      type: db.QueryTypes.RAW
    })
      .spread((datas, metadata) => {
        console.log('DBAccess : getHomeOshirase result...')
        // console.log(datas)
        return resolve(datas)
      })
  })
}

/**
 * ホーム画面に表示する記事情報（最新または人気上位の3件）を取得（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 * @param isNew 最新記事：true、人気記事：false
 */
function getHomeKiji(db, req, isNew) {
  return new Promise((resolve, reject) => {
    // 最新の3件を取得
    var sql =
      "select kij.t_kiji_pk, kij.title, kij.file_path, kij.post_dt, " +
      " array_to_string(array(select '#' || hashtag from t_kiji_hashtag has where kij.t_kiji_pk = has.t_kiji_pk order by has.seq_no), '　') as hashtag_str," +
      " coalesce(goo.cnt, 0) as good_cnt" +
      " from t_kiji kij" +
      " left join (select t_kiji_pk, count(*) as cnt from t_good group by t_kiji_pk) goo on kij.t_kiji_pk = goo.t_kiji_pk" +
      " where kij.delete_flg = '0'" +
      " and kij.post_dt >= current_timestamp + '-1 months'"
    if (isNew) {
      sql += " order by kij.post_dt desc, kij.post_tm desc"
      sql += " limit 5"
    } else {
      sql += " order by coalesce(goo.cnt, 0) desc, kij.post_dt desc, kij.post_tm desc"
      sql += " limit 3"
    }

    db.query(sql, {
      type: db.QueryTypes.RAW
    })
      .spread((datas, metadata) => {
        console.log('DBAccess : getHomeKiji result...')
        // console.log(datas)
        return resolve(datas)
      })
  })
}

/**
 * ホーム画面に表示するチャット未読件数を取得（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
function getChatMidoku(db, req) {
  return new Promise((resolve, reject) => {
    var sql =
      "select count(*)  as chat_cnt" +
      " from t_chat cha" +
      " left join t_chat_kidoku kid on cha.to_shain_pk = kid.t_shain_pk and cha.from_shain_pk = kid.from_shain_pk" +
      " where cha.delete_flg = '0'" +
      " and cha.to_shain_pk = :t_shain_pk" +
      " and cha.t_chat_pk > coalesce(kid.t_chat_pk, 0)"

    db.query(sql, {
      replacements: { t_shain_pk: req.body.loginShainPk },
      type: db.QueryTypes.RAW
    })
      .spread((datas, metadata) => {
        console.log('DBAccess : getChatMidoku result...')
        // console.log(datas)
        return resolve(datas)
      })
  })
}

/**
 * ホーム画面に表示する記事未読件数を取得（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
function getArticleMidoku(db, req) {
  return new Promise((resolve, reject) => {
    var sql =
      "select count(*)  as article_cnt" +
      " from t_kiji kij" +
      " left join t_kiji_kidoku kid on kij.t_kiji_category_pk = kid.t_kiji_category_pk and kid.t_shain_pk = :t_shain_pk" +
      " where kij.delete_flg = '0'" +
      " and kij.t_kiji_pk > coalesce(kid.t_kiji_pk, 0)"

    db.query(sql, {
      replacements: { t_shain_pk: req.body.loginShainPk },
      type: db.QueryTypes.RAW
    })
      .spread((datas, metadata) => {
        console.log('DBAccess : getArticleMidoku result...')
        // console.log(datas)
        return resolve(datas)
      })
  })
}

/**
 * 広告情報を取得（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
function getKokoku(db, req) {
  return new Promise((resolve, reject) => {
    var sql =
      "select renban, file_path, comment" +
      " from t_kokoku" +
      " where renban = :renban"
    db.query(sql, {
      replacements: { renban: req.body.renban },
      type: db.QueryTypes.RAW
    })
      .spread((datas, metadata) => {
        console.log('DBAccess : getKokoku result...')
        // console.log(datas)
        return resolve(datas)
      })
  })
}

/**
 * お知らせ一覧を取得（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
function getOshiraseList(db, req) {
  return new Promise((resolve, reject) => {
    var sql =
      "select renban, notice_dt, title" +
      " from t_oshirase" +
      " where delete_flg = '0'" +
      " order by notice_dt desc"
    db.query(sql, {
      type: db.QueryTypes.RAW
    })
      .spread((datas, metadata) => {
        console.log('DBAccess : getOshiraseList result...')
        // console.log(datas)
        return resolve(datas)
      })
  })
}

/**
 * お知らせ情報を取得（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
function getOshirase(db, req) {
  return new Promise((resolve, reject) => {
    // 直近1ヶ月を取得
    var sql =
      "select renban, notice_dt, title, comment" +
      " from t_oshirase" +
      " where renban = :renban"
    db.query(sql, {
      replacements: { renban: req.body.renban },
      type: db.QueryTypes.RAW
    })
      .spread((datas, metadata) => {
        console.log('DBAccess : getOshirase result...')
        // console.log(datas)
        return resolve(datas)
      })
  })
}

/**
 * 記事情報を取得（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 * @param mode "new"：最新記事、"popular"：人気記事、"favorite"：お気に入り
 */
function getKijiList(db, req, mode) {
  return new Promise((resolve, reject) => {
    var sql =
      "select kij.t_kiji_pk, kij.title, kij.file_path, kij.post_dt, " +
      " array_to_string(array(select '#' || hashtag from t_kiji_hashtag has where kij.t_kiji_pk = has.t_kiji_pk order by has.seq_no), '　') as hashtag_str," +
      " coalesce(goo.cnt, 0) as good_cnt" +
      " from t_kiji kij" +
      " left join (select t_kiji_pk, count(*) as cnt from t_good group by t_kiji_pk) goo on kij.t_kiji_pk = goo.t_kiji_pk" +
      " where kij.delete_flg = '0'"
    switch (mode) {
      case "new":
        sql +=
          " and kij.post_dt >= current_timestamp + '-1 months'" +
          " order by kij.post_dt desc, kij.post_tm desc"
        break
      case "popular":
        sql +=
          " and kij.post_dt >= current_timestamp + '-1 months'" +
          " order by coalesce(goo.cnt, 0) desc, kij.post_dt desc, kij.post_tm desc"
        break
      case "favorite":
        sql +=
          " and exists (select * from t_favorite fav where kij.t_kiji_pk = fav.t_kiji_pk and fav.t_shain_pk = :t_shain_pk)" +
          " order by kij.post_dt desc, kij.post_tm desc"
        break
    }

    db.query(sql, {
      replacements: {
        t_shain_pk: req.body.loginShainPk,
      },
      type: db.QueryTypes.RAW
    })
      .spread((datas, metadata) => {
        console.log('DBAccess : getKijiList result...')
        // console.log(datas)
        return resolve(datas)
      })
  })
}

module.exports = router
