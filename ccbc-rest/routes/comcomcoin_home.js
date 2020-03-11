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

  // const resdatas = { adList: [], infoList: [], newArticleList: [], popularArticleList: [] }
  // resdatas.adList = [
  //   { renban: 1, file_path: 'kokoku_1.jpg' },
  //   { renban: 2, file_path: 'kokoku_2.jpg' },
  //   { renban: 3, file_path: 'kokoku_3.jpg' },
  //   { renban: 4, file_path: 'kokoku_4.jpg' },
  //   { renban: 5, file_path: 'CONSADOLE.png' },
  // ]
  // resdatas.infoList = [
  //   { notice_dt: "2019/04/12", title: "北海道新聞にHARVESTの記事が掲載されました。" },
  //   { notice_dt: "2019/03/15", title: "HARVESTに関するプレスリリースしました。" },
  //   { notice_dt: "2019/03/15", title: "HARVESTに関するプレスリリースしました。" },
  // ]
  // resdatas.newArticleList = [
  //   { t_kiji_pk: 1, title: "マラソン大会へのお誘い", hashtag_str: "#スポーツ　#マラソン　", file_path: "test001.png", good_cnt: 12 },
  //   { t_kiji_pk: 2, title: "ビアガーデン開催", hashtag_str: "#飲み会　#お店　", file_path: "", good_cnt: 0 },
  //   { t_kiji_pk: 3, title: "ビアガーデン開催", hashtag_str: "#飲み会　#お店　", file_path: "", good_cnt: 0 },
  // ]
  // resdatas.popularArticleList = [
  //   { t_kiji_pk: 1, title: "マラソン大会へのお誘い", hashtag_str: "#スポーツ　#マラソン　", file_path: "test001.png", good_cnt: 12 },
  //   { t_kiji_pk: 2, title: "ビアガーデン開催", hashtag_str: "#飲み会　#お店　", file_path: "", good_cnt: 0 },
  //   { t_kiji_pk: 3, title: "ビアガーデン開催", hashtag_str: "#飲み会　#お店　", file_path: "", good_cnt: 0 },
  // ]
  // res.json({
  //   status: true,
  //   data: resdatas
  // })

  console.log('API : findHome - end')
})

/**
 * API : findHomeAdvertise
 * ComComCoinホーム広告画面に表示する情報を取得
 */
router.post('/findHomeAdvertise', (req, res) => {
  console.log('API : findHomeAdvertise - start')
  findHomeAdvertise(req, res)

  // const resdatas = {
  //   file_path: "CONSADOLE.png",
  //   comment: "サッカーＪ１　コンサドーレ札幌の観戦案内です。\n" +
  //     "■8月10日（土）14:00キックオフ　vs 浦和レッズ\n" +
  //     "■8月24日（土）13:00キックオフ　vs FC東京\n" +
  //     "場所はいずれも札幌ドーム。\n" +
  //     "チケットは「浦和レッズ戦　7枚」「FC東京戦　7枚」です。\n\n" +
  //     "観戦を希望される方は、三上まで連絡ください。\n" +
  //     "※締め切りは、6月19日（水）17時。\n" +
  //     "\n" +
  //     "※締め切りは上記の通りですが、チケットの数に限りがあることと、観戦当日までの段取りの調整を鑑み、早めの連絡をお願いいたします。\n" +
  //     "\n\n" +
  //     "ご存知の通り、今年度から弊社はコンサドーレ札幌のサポートシップ・パートナーとなりました。\n\n" +
  //     "5月4日のヴィッセル神戸戦を観戦したメンバーから好評をいただき、サッカーを知らない人でも楽しめたようです。\n\n" +
  //     "みなさん、北海道のプロスポーツを応援し、北海道を元気にしましょう！\n"
  // }
  // res.json({
  //   status: true,
  //   data: resdatas
  // })

  console.log('API : findHomeAdvertise - end')
})

/**
 * API : findHomeInfoList
 * ComComCoinホームお知らせ一覧画面に表示する情報を取得
 */
router.post('/findHomeInfoList', (req, res) => {
  console.log('API : findHomeInfoList - start')
  findHomeInfoList(req, res)

  // const resdatas = [
  //   {
  //     renban: 1,
  //     title: '北海道新聞にHARVESTの記事が掲載されました。',
  //     notice_dt: '2019/04/12'
  //   },
  //   {
  //     renban: 2,
  //     title: 'HARVESTに関するプレスリリースしました。',
  //     notice_dt: '2019/03/15'
  //   },
  //   {
  //     renban: 3,
  //     title: '財界さっぽろ様の企業特集に掲載されました。',
  //     notice_dt: '2018/09/15'
  //   },
  //   {
  //     renban: 4,
  //     title: '財界さっぽろ様の企業特集に掲載されました。',
  //     notice_dt: '2018/09/15'
  //   },
  //   {
  //     renban: 5,
  //     title: '財界さっぽろ様の企業特集に掲載されました。',
  //     notice_dt: '2018/09/15'
  //   },
  //   {
  //     renban: 6,
  //     title: '財界さっぽろ様の企業特集に掲載されました。',
  //     notice_dt: '2018/09/15'
  //   },
  //   {
  //     renban: 7,
  //     title: '財界さっぽろ様の企業特集に掲載されました。',
  //     notice_dt: '2018/09/15'
  //   },
  //   {
  //     renban: 8,
  //     title: '財界さっぽろ様の企業特集に掲載されました。',
  //     notice_dt: '2018/09/15'
  //   },
  //   {
  //     renban: 9,
  //     title: '財界さっぽろ様の企業特集に掲載されました。',
  //     notice_dt: '2018/09/15'
  //   },
  //   {
  //     renban: 10,
  //     title: '財界さっぽろ様の企業特集に掲載されました。',
  //     notice_dt: '2018/09/15'
  //   },
  //   {
  //     renban: 11,
  //     title: '財界さっぽろ様の企業特集に掲載されました。',
  //     notice_dt: '2018/09/15'
  //   },
  //   {
  //     renban: 12,
  //     title: '財界さっぽろ様の企業特集に掲載されました。',
  //     notice_dt: '2018/09/15'
  //   },
  //   {
  //     renban: 13,
  //     title: '財界さっぽろ様の企業特集に掲載されました。',
  //     notice_dt: '2018/09/15'
  //   },
  //   {
  //     renban: 14,
  //     title: '財界さっぽろ様の企業特集に掲載されました。',
  //     notice_dt: '2018/09/15'
  //   }
  // ]
  // res.json({
  //   status: true,
  //   data: resdatas
  // })

  console.log('API : findHomeInfoList - end')
})

/**
 * API : findHomeInformation
 * ComComCoinホームお知らせ詳細画面に表示する情報を取得
 */
router.post('/findHomeInformation', (req, res) => {
  console.log('API : findHomeInformation - start')
  findHomeInformation(req, res)

  // const resdatas = {
  //   title: "HARVESTに関するプレスリリースしました。",
  //   comment: "アプリケーション・ソフトウェア開発を行う株式会社クリエイティブ・コンサルタント（本社：北海道札幌市、代表取締役：斉藤雅之）は3月22日、ブロックチェーン技術を活用した企業向け社内仮想通貨（以下、企業コイン）サービス「HARVEST」と「ComComCoin」を発表しました。\n\n" +
  //     "▼お問い合わせ先\n" +
  //     "株式会社クリエイティブ・コンサルタント\n\n" +
  //     "〒060-0031　札幌市中央区北１条東２丁目５番地３　塚本ビル北１館２階\n" +
  //     "TEL 011-210-7130\n" +
  //     "E-Mail：press@hokkaido-ima.co.jp（担当者：坂本 義和）",
  //   notice_dt: new Date()
  // }
  // res.json({
  //   status: true,
  //   data: resdatas
  // })

  console.log('API : findHomeInformation - end')
})

/**
 * API : findHomeArticleList
 * ComComCoinホームお知らせ一覧画面に表示する情報を取得
 */
router.post('/findHomeArticleList', (req, res) => {
  console.log('API : findHomeArticleList - start')
  findHomeArticleList(req, res)

  // const resdatas = [
  //   {
  //     t_kiji_pk: 1,
  //     title: 'リーダーコンピテンシー開催案内',
  //     hashtag_str: '#研修, #案内',
  //     cnt: 11
  //   },
  //   {
  //     t_kiji_pk: 1,
  //     title: '夏キャンプのお知らせ',
  //     hashtag_str: '#アウトドア, #案内',
  //     cnt: 9
  //   },
  //   {
  //     t_kiji_pk: 1,
  //     title: '第三回マラソン大会開催案内',
  //     hashtag_str: '#スポーツ',
  //     cnt: 7
  //   },
  //   {
  //     t_kiji_pk: 1,
  //     title: '7月の北海道の天気',
  //     hashtag_str: '#天気',
  //     cnt: 6
  //   },
  //   {
  //     t_kiji_pk: 1,
  //     title: '6月おすすめの本',
  //     hashtag_str: '#本',
  //     cnt: 5
  //   },
  //   {
  //     t_kiji_pk: 1,
  //     title: '今日の献立',
  //     hashtag_str: '#料理',
  //     cnt: 3
  //   },
  //   {
  //     t_kiji_pk: 1,
  //     title: '今日のプログラミング講座',
  //     hashtag_str: '#プログラミング',
  //     cnt: 1
  //   },
  //   {
  //     t_kiji_pk: 1,
  //     title: '6/16の天気',
  //     hashtag_str: '#天気',
  //     cnt: 1
  //   },
  //   {
  //     t_kiji_pk: 1,
  //     title: 'ブロックチェーン勉強会について',
  //     hashtag_str: '#研修',
  //     cnt: 1
  //   },
  //   {
  //     t_kiji_pk: 1,
  //     title: '石垣の一言',
  //     hashtag_str: '#その他',
  //     cnt: 0
  //   },
  //   {
  //     t_kiji_pk: 1,
  //     title: '今日のポエム from Nakayama',
  //     hashtag_str: '#その他',
  //     cnt: 0
  //   },
  //   {
  //     t_kiji_pk: 1,
  //     title: '江別の謎',
  //     hashtag_str: '#その他',
  //     cnt: 0
  //   }
  // ]
  // res.json({
  //   status: true,
  //   data: resdatas
  // })

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

  const resdatas = { adList: [], infoList: [], newArticleList: [], popularArticleList: [] }

  // 広告の取得
  resdatas.adList = await getHomeKokoku(db, req)
  // お知らせの取得
  resdatas.infoList = await getHomeOshirase(db, req)
  // 最新記事の取得
  resdatas.newArticleList = await getHomeKiji(db, req, true)
  // 人気記事の取得
  resdatas.popularArticleList = await getHomeKiji(db, req, false)

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
        console.log(datas)
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
        console.log(datas)
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
    } else {
      sql += " order by coalesce(goo.cnt, 0) desc, kij.post_dt desc, kij.post_tm desc"
    }
    sql += " limit 3"

    db.query(sql, {
      type: db.QueryTypes.RAW
    })
      .spread((datas, metadata) => {
        console.log('DBAccess : getHomeKiji result...')
        console.log(datas)
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
        console.log(datas)
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
        console.log(datas)
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
        console.log(datas)
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
        console.log(datas)
        return resolve(datas)
      })
  })
}

module.exports = router
