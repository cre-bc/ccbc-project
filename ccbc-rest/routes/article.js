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

var multer = require('multer')
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // forever起動時にuploadが正常に動作しないため、暫定対応
    cb(null, '/home/BLOCKCHAIN/ccbc-rest/public/uploads/article')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({ storage: storage })

const READ_COUNT = 10
const GET_COIN = 10

/**
 * API : findCategory
 * 記事カテゴリ一覧（カテゴリ別、未読件数付き）を取得
 */
router.post('/findCategory', (req, res) => {
  console.log('API : findCategory - start')
  findCategoryList(req, res)
  console.log('API : findCategory - end')
})

/**
 * API : findArticle
 * 記事リスト（条件により絞り込み可能）を取得
 */
router.post('/findArticle', (req, res) => {
  console.log('API : findArticle - start')
  findArticleList(req, res)
  console.log('API : findArticle - end')
})

/**
 * API : edit
 * 記事情報を登録（新規登録も編集も）
 */
router.post('/edit', (req, res) => {
  console.log('API : edit - start')
  edit(req, res)
  console.log('API : edit - end')
})

/**
 * API : upload
 * 記事情報のファイルをアップロード
 */
router.post('/upload', upload.fields([{ name: 'image' }]), (req, res) => {
  console.log('API : upload - start')
  res.json({
    status: true
  })
  console.log('API : upload - end')
})

/**
 * API : good
 * 記事情報をいいね登録（登録も解除も）
 */
router.post('/good', (req, res) => {
  console.log('API : good - start')
  good(req, res)
  console.log('API : good - end')
})

/**
 * API : favorite
 * 記事情報をお気に入り登録（登録も解除も）
 */
router.post('/favorite', (req, res) => {
  console.log('API : favorite - start')
  favorite(req, res)
  console.log('API : favorite - end')
})

// ----------------------------------------------------------------------
/**
 * 記事カテゴリ一覧（カテゴリ別、未読件数付き）を取得
 * @param req リクエスト
 * @param res レスポンス
 */
async function findCategoryList(req, res) {
  db = db2.sequelizeDB(req)

  // 記事カテゴリの取得
  const resdatas = await selectKijiCategory(db, req)
  res.json({
    status: true,
    data: resdatas
  })
}

/**
 * 記事リスト（条件により絞り込み可能）を取得
 * @param req リクエスト
 * @param res レスポンス
 */
async function findArticleList(req, res) {
  db = db2.sequelizeDB(req)

  // 記事リストの取得
  const resdatas = await selectKijiWithCond(db, req)
  res.json({
    status: true,
    data: resdatas
  })

  // 記事既読の更新
  if (resdatas.length > 0) {
    const kijiPk = resdatas[0].t_kiji_pk
    const kijiCategoryPk = resdatas[0].t_kiji_category_pk
    db.transaction(async function (tx) {
      // DB更新
      await insertOrUpdateKijiKidoku(db, tx, req, kijiPk, kijiCategoryPk)
    })
      .then(result => {
        // コミットしたらこっち
        console.log('findArticleList : 正常')
      })
      .catch(e => {
        // ロールバックしたらこっち
        console.log('findArticleList : 異常', e)
        res.json({ status: false })
      })
  }
}

/**
 * 記事情報を登録（新規登録も編集も）
 * @param req リクエスト
 * @param res レスポンス
 */
async function edit(req, res) {
  db = db2.sequelizeDB(req)

  db.transaction(async function (tx) {
    // 記事テーブルの更新
    let isInsert = true
    if (req.body.t_kiji_pk !== null && req.body.t_kiji_pk !== "") {
      isInsert = false
    }
    var ret = await insertOrUpdateKiji(db, tx, req, isInsert)
    var kijiPk = req.body.t_kiji_pk
    if (isInsert) {
      kijiPk = ret[0].t_kiji_pk
    }

    // 記事ハッシュタグテーブルの更新（delete and insert）
    if (!isInsert) {
      await deleteKijiHashtag(db, tx, req)
    }
    if (req.body.hashtag_str !== "") {
      var hashtag = req.body.hashtag_str.replace("　", " ").replace("　", " ").split(" ")
      var seq = 0
      for (var i in hashtag) {
        if (hashtag[i] !== "") {
          var kijiHashtag = {
            t_kiji_pk: req.body.t_kiji_pk,
            seq_no: seq++,
            t_kiji_category_pk: req.body.t_kiji_category_pk,
            hashtag: hashtag[i]
          }
          await insertKijiHashtag(db, tx, req, kijiPk, kijiHashtag)
        }
      }
    }

    // 贈与テーブルの追加と、記事テーブルに贈与PKを更新
    if (isInsert) {
      // BCへの書き込み
      const transactionId = await bcrequest(req)

      // 贈与テーブルの追加
      var ret = await insertZoyo(db, tx, req, transactionId)
      const zoyoPk = ret[0].t_zoyo_pk

      // 記事テーブルの更新
      await updateKijiAfterZoyo(db, tx, req, kijiPk, zoyoPk)
    }
  })
    .then(result => {
      // コミットしたらこっち
      console.log('edit : 正常')
      res.json({ status: true })
    })
    .catch(e => {
      // ロールバックしたらこっち
      console.log('edit : 異常', e)
      res.json({ status: false })
    })
}

/**
 * 記事情報をいいね登録（登録も解除も）
 * @param req リクエスト
 * @param res レスポンス
 */
async function good(req, res) {
  db = db2.sequelizeDB(req)

  db.transaction(async function (tx) {
    await insertOrUpdateGood(db, tx, req)
  })
    .then(result => {
      // コミットしたらこっち
      console.log('good : 正常')
      res.json({ status: true })
    })
    .catch(e => {
      // ロールバックしたらこっち
      console.log('good : 異常', e)
      res.json({ status: false })
    })
}

/**
 * 記事情報をお気に入り登録（登録も解除も）
 * @param req リクエスト
 * @param res レスポンス
 */
async function favorite(req, res) {
  db = db2.sequelizeDB(req)

  db.transaction(async function (tx) {
    await insertOrUpdateFavorite(db, tx, req)
  })
    .then(result => {
      // コミットしたらこっち
      console.log('favorite : 正常')
      res.json({ status: true })
    })
    .catch(e => {
      // ロールバックしたらこっち
      console.log('favorite : 異常', e)
      res.json({ status: false })
    })
}

// ----------------------------------------------------------------------
/**
 * 記事カテゴリ一覧（カテゴリ別、未読件数付き）を取得（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
function selectKijiCategory(db, req) {
  return new Promise((resolve, reject) => {
    // 記事カテゴリテーブルの情報と、記事の未読件数（記事既読テーブルに登録されているIDより新しいIDの件数）を一緒に取得
    var sql =
      "select cat.t_kiji_category_pk, cat.category_nm, cat.get_coin, cat.sort_num, cat.spe_category_flg, count(kij.t_kiji_pk) AS midoku_cnt" +
      " from t_kiji_category cat" +
      " left join t_kiji_kidoku kid" +
      " on cat.t_kiji_category_pk = kid.t_kiji_category_pk" +
      " and kid.t_shain_pk = :shain_pk" +
      " left join t_kiji kij " +
      " on cat.t_kiji_category_pk = kij.t_kiji_category_pk" +
      " and kij.delete_flg = '0'" +
      " and kij.t_kiji_pk > coalesce(kid.t_kiji_pk, -1)" +
      " where cat.delete_flg = '0'" +
      " group by cat.t_kiji_category_pk, cat.category_nm, cat.get_coin, cat.sort_num, cat.spe_category_flg" +
      " order by cat.sort_num, cat.t_kiji_category_pk"
    db.query(sql, {
      replacements: { shain_pk: req.body.loginShainPk },
      type: db.QueryTypes.RAW
    })
      .spread((datas, metadata) => {
        console.log('DBAccess : selectKijiCategory result...')
        // console.log(datas)
        return resolve(datas)
      })
  })
}

/**
 * 記事リスト（条件により絞り込み可能）を取得（DBアクセス）
 * @param db SequelizeされたDBインスタンス
 * @param req リクエスト
 */
function selectKijiWithCond(db, req) {
  return new Promise((resolve, reject) => {
    // 条件
    var sqlcond_kiji_category_pk = ""
    var sqlcond_kiji_pk = ""
    var sqlcond_dt_from = ""
    var sqlcond_dt_to = ""
    var sqlcond_hashtag = ""
    var sqlcond_keyword = ""
    var param_hashtag = {}
    var param_keyword = {}
    if (req.body.current_kiji_category_pk !== null && req.body.current_kiji_category_pk !== "") {
      // 記事カテゴリ選択時
      sqlcond_kiji_category_pk = " and kij.t_kiji_category_pk = :t_kiji_category_pk"
    }
    if (req.body.searchCondKijiPk !== null && req.body.searchCondKijiPk !== "") {
      // ホーム画面から遷移時の記事直接指定
      sqlcond_kiji_pk = " and kij.t_kiji_pk = :t_kiji_pk"
    } else if (req.body.readLastKijiPk !== null && req.body.readLastKijiPk !== "") {
      // 最下部へスクロールした際の過去分読み込み
      sqlcond_kiji_pk = " and kij.t_kiji_pk < :t_kiji_pk_read_last"
    }
    if (req.body.searchCondYear !== null && req.body.searchCondYear !== '') {
      // 検索機能：投稿年指定
      sqlcond_dt_from = " and kij.post_dt >= :dt_from"
      sqlcond_dt_to = " and kij.post_dt <= :dt_to"
    }
    if (req.body.searchCondHashtag !== null && req.body.searchCondHashtag !== '') {
      // 検索機能：タグ
      // スペース区切りでの複数キーワードをAND条件で指定
      var params = req.body.searchCondHashtag.replace("　", " ").split(" ")
      for (var i = 0; i < params.length; i++) {
        sqlcond_hashtag = " and exists (select * from t_kiji_hashtag has where kij.t_kiji_pk = has.t_kiji_pk and lower(has.hashtag) like :hashtag" + i + ")"
        param_hashtag['hashtag' + i] = "%" + params[i].toLowerCase() + "%"
      }
    }
    if (req.body.searchCondKeyword !== null && req.body.searchCondKeyword !== '') {
      // 検索機能：キーワード
      // スペース区切りでの複数キーワードをAND条件で指定
      var params = req.body.searchCondKeyword.replace("　", " ").split(" ")
      for (var i = 0; i < params.length; i++) {
        sqlcond_keyword += " and (lower(kij.title) like :keyword" + i + " or lower(kij.contents) like :keyword" + i + ")"
        param_keyword['keyword' + i] = "%" + params[i].toLowerCase() + "%"
      }
    }

    // 記事情報テーブルより条件を絞り込んで取得
    var sql =
      "select kij.t_kiji_pk, kij.t_kiji_category_pk, kij.t_shain_pk, kij.title, kij.contents, kij.post_dt, kij.post_tm, kij.file_path," +
      " sha.shimei as shain_nm, sha.image_file_nm as shain_image_path," +
      " case when goo.t_kiji_pk is null then '0' else '1' end as good_flg," +
      " case when fav.t_kiji_pk is null then '0' else '1' end as favorite_flg," +
      " array_to_string(array(select '#' || hashtag from t_kiji_hashtag has where kij.t_kiji_pk = has.t_kiji_pk order by has.seq_no), '　') as hashtag_str," +
      " cat.category_nm" +
      " from t_kiji kij" +
      " inner join t_kiji_category cat on kij.t_kiji_category_pk = cat.t_kiji_category_pk" +
      " left join t_shain sha on kij.t_shain_pk = sha.t_shain_pk" +
      " left join t_good goo on kij.t_kiji_pk = goo.t_kiji_pk and goo.t_shain_pk = :t_shain_pk" +
      " left join t_favorite fav on kij.t_kiji_pk = fav.t_kiji_pk and fav.t_shain_pk = :t_shain_pk" +
      " where kij.delete_flg = '0'" +
      sqlcond_kiji_category_pk +
      sqlcond_kiji_pk +
      sqlcond_dt_from +
      sqlcond_dt_to +
      sqlcond_hashtag +
      sqlcond_keyword +
      " order by kij.t_kiji_pk desc" +
      " limit " + READ_COUNT
    db.query(sql, {
      replacements:
        Object.assign(
          {
            t_kiji_category_pk: req.body.current_kiji_category_pk,
            t_shain_pk: req.body.loginShainPk,
            t_kiji_pk: req.body.searchCondKijiPk,
            t_kiji_pk_read_last: req.body.readLastKijiPk,
            dt_from: req.body.searchCondYear + "/01/01",
            dt_to: req.body.searchCondYear + "/12/31",
          },
          param_hashtag,
          param_keyword),
      type: db.QueryTypes.RAW
    })
      .spread((datas, metadata) => {
        console.log('DBAccess : selectKijiWithCond result...')
        // console.log(datas)
        return resolve(datas)
      })
  })
}

/**
 * 記事情報（t_kiji）テーブルのinsert or update
 * @param db SequelizeされたDBインスタンス
 * @param tx トランザクション
 * @param req リクエスト
 * @param isInsert 追加の場合はtrue
 */
function insertOrUpdateKiji(db, tx, req, isInsert) {
  return new Promise((resolve, reject) => {
    var sql = ""
    if (isInsert) {
      sql =
        "insert into t_kiji (t_kiji_category_pk, t_shain_pk, title, contents, post_dt, post_tm, file_path, delete_flg, insert_user_id, insert_tm, update_user_id, update_tm) " +
        " values (:t_kiji_category_pk, :t_shain_pk, :title, :contents, current_timestamp, current_timestamp, :file_path, '0', :user_id, current_timestamp, :user_id, current_timestamp) " +
        " returning t_kiji_pk"
    } else {
      sql =
        "update t_kiji set " +
        " title = :title, contents = :contents, file_path = :file_path," +
        " update_user_id = :user_id, update_tm = current_timestamp" +
        " where t_kiji_pk = :t_kiji_pk"
    }

    db.query(sql, {
      transaction: tx,
      replacements: {
        t_kiji_pk: req.body.t_kiji_pk,
        t_kiji_category_pk: req.body.t_kiji_category_pk,
        t_shain_pk: req.body.loginShainPk,
        title: req.body.title,
        contents: req.body.contents,
        hashtag: req.body.hashtag,
        file_path: req.body.file_path,
        user_id: req.body.loginShainPk
      }
    })
      .spread((datas, metadata) => {
        return resolve(datas)
      })
  })
}

/**
 * 記事情報（t_kiji）テーブルへの贈与PK更新
 * @param db SequelizeされたDBインスタンス
 * @param tx トランザクション
 * @param req リクエスト
 * @param t_kiji_pk 記事テーブルPK
 * @param t_zoyo_pk 贈与テーブルPK
 */
function updateKijiAfterZoyo(db, tx, req, t_kiji_pk, t_zoyo_pk) {
  return new Promise((resolve, reject) => {
    var sql =
      "update t_kiji set " +
      " t_coin_ido_pk = :t_zoyo_pk" +
      " where t_kiji_pk = :t_kiji_pk"

    db.query(sql, {
      transaction: tx,
      replacements: {
        t_kiji_pk: t_kiji_pk,
        t_zoyo_pk: t_zoyo_pk
      }
    })
      .spread((datas, metadata) => {
        return resolve(datas)
      })
  })
}

/**
 * 贈与情報（t_zoyo）テーブルのinsert
 * @param db SequelizeされたDBインスタンス
 * @param tx トランザクション
 * @param req リクエスト
 * @param transactionId BC登録時のトランザクションID
 */
function insertZoyo(db, tx, req, transactionId) {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into t_zoyo (zoyo_moto_shain_pk, zoyo_saki_shain_pk, transaction_id, zoyo_comment, nenji_flg, delete_flg, insert_user_id, insert_tm) " +
      " values (:zoyo_moto_shain_pk, :zoyo_saki_shain_pk, :transaction_id, :zoyo_comment, :nenji_flg, '0', :insert_user_id, current_timestamp) " +
      " returning t_zoyo_pk"

    db.query(sql, {
      transaction: tx,
      replacements: {
        zoyo_moto_shain_pk: jimuShainPk,
        zoyo_saki_shain_pk: req.body.loginShainPk,
        transaction_id: transactionId,
        zoyo_comment: "記事投稿",
        nenji_flg: "2",
        insert_user_id: req.body.loginShainPk
      }
    })
      .spread((datas, metadata) => {
        return resolve(datas)
      })
  })
}

/**
 * 記事ハッシュタグ（t_kiji_hashtag）テーブルのdelete
 * @param db SequelizeされたDBインスタンス
 * @param tx トランザクション
 * @param req リクエスト
 */
function deleteKijiHashtag(db, tx, req) {
  return new Promise((resolve, reject) => {
    var sql =
      "delete from t_kiji_hashtag where t_kiji_pk = :t_kiji_pk"

    db.query(sql, {
      transaction: tx,
      replacements: {
        t_kiji_pk: req.body.t_kiji_pk
      }
    })
      .spread((datas, metadata) => {
        return resolve(datas)
      })
  })
}

/**
 * 記事ハッシュタグ（t_kiji_hashtag）テーブルのinsert
 * @param db SequelizeされたDBインスタンス
 * @param tx トランザクション
 * @param req リクエスト
 * @param kijiPk 記事テーブルPK
 * @param tKijiHashtag 記事ハッシュタグテーブル情報
 */
function insertKijiHashtag(db, tx, req, kijiPk, tKijiHashtag) {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into t_kiji_hashtag (t_kiji_pk, seq_no, t_kiji_category_pk, hashtag, insert_user_id, insert_tm, update_user_id, update_tm) " +
      " values (:t_kiji_pk, :seq_no, :t_kiji_category_pk, :hashtag, :user_id, current_timestamp, :user_id, current_timestamp) "

    db.query(sql, {
      transaction: tx,
      replacements: {
        t_kiji_pk: kijiPk,
        seq_no: tKijiHashtag.seq_no,
        t_kiji_category_pk: tKijiHashtag.t_kiji_category_pk,
        hashtag: tKijiHashtag.hashtag,
        user_id: req.body.loginShainPk
      }
    })
      .spread((datas, metadata) => {
        return resolve(datas)
      })
  })
}

/**
 * いいね（t_good）テーブルのinsert or update
 * @param db SequelizeされたDBインスタンス
 * @param tx トランザクション
 * @param req リクエスト
 */
function insertOrUpdateGood(db, tx, req) {
  return new Promise((resolve, reject) => {
    var sql = ""
    if (req.body.good_flg === "1") {
      sql =
        "insert into t_good (t_kiji_pk, t_shain_pk, insert_user_id, insert_tm, update_user_id, update_tm) " +
        " values (:t_kiji_pk, :t_shain_pk, :user_id, current_timestamp, :user_id, current_timestamp) " +
        " on conflict do nothing"
    } else {
      sql =
        "delete from t_good " +
        " where t_kiji_pk = :t_kiji_pk and t_shain_pk = :t_shain_pk"
    }
    db.query(sql, {
      transaction: tx,
      replacements: {
        t_kiji_pk: req.body.t_kiji_pk,
        t_shain_pk: req.body.loginShainPk,
        user_id: req.body.loginShainPk
      }
    })
      .spread((datas, metadata) => {
        return resolve(datas)
      })
  })
}

/**
 * お気に入り（t_favorite）テーブルのinsert or update
 * @param db SequelizeされたDBインスタンス
 * @param tx トランザクション
 * @param req リクエスト
 */
function insertOrUpdateFavorite(db, tx, req) {
  return new Promise((resolve, reject) => {
    var sql = ""
    if (req.body.favorite_flg === "1") {
      sql =
        "insert into t_favorite (t_kiji_pk, t_shain_pk, insert_user_id, insert_tm, update_user_id, update_tm) " +
        " values (:t_kiji_pk, :t_shain_pk, :user_id, current_timestamp, :user_id, current_timestamp) " +
        " on conflict do nothing"
    } else {
      sql =
        "delete from t_favorite " +
        " where t_kiji_pk = :t_kiji_pk and t_shain_pk = :t_shain_pk"
    }
    db.query(sql, {
      transaction: tx,
      replacements: {
        t_kiji_pk: req.body.t_kiji_pk,
        t_shain_pk: req.body.loginShainPk,
        user_id: req.body.loginShainPk
      }
    })
      .spread((datas, metadata) => {
        return resolve(datas)
      })
  })
}

/**
 * 記事既読（t_kiji_kidoku）テーブルのinsert or update
 * @param db SequelizeされたDBインスタンス
 * @param tx トランザクション
 * @param req リクエスト
 * @param kijiPk 記事テーブルPK
 * @param kijiCategoryPk 記事カテゴリーテーブルPK
 */
function insertOrUpdateKijiKidoku(db, tx, req, kijiPk, kijiCategoryPk) {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into t_kiji_kidoku (t_shain_pk, t_kiji_category_pk, t_kiji_pk, insert_user_id, insert_tm, update_user_id, update_tm) " +
      " values (:t_shain_pk, :t_kiji_category_pk, :t_kiji_pk, :user_id, current_timestamp, :user_id, current_timestamp) " +
      " on conflict (t_shain_pk, t_kiji_category_pk) do " +
      "update set t_kiji_pk = :t_kiji_pk, update_user_id = :user_id, update_tm = current_timestamp" +
      " where t_kiji_kidoku.t_kiji_pk < :t_kiji_pk"

    db.query(sql, {
      transaction: tx,
      replacements: {
        t_shain_pk: req.body.loginShainPk,
        t_kiji_category_pk: kijiCategoryPk,
        t_kiji_pk: kijiPk,
        user_id: req.body.loginShainPk
      }
    })
      .spread((datas, metadata) => {
        return resolve(datas)
      })
  })
}

/**
 * BCコイン送金用関数
 * @param req リクエスト
 */
function bcrequest(req) {
  return new Promise((resolve, reject) => {
    var param = {
      from_account: [jimuAccount],
      to_account: [req.body.bcAccount],
      password: [jimuPassword],
      coin: [GET_COIN],
      bc_addr: req.body.bc_addr
    }
    console.log('bcrequest.param:', param)
    request
      .post(bcdomain + '/bc-api/send_coin')
      .send(param)
      .end((err, res) => {
        if (err) {
          console.log('bcrequest.err:', err)
          return
        }
        // 検索結果表示
        console.log('bcrequest.result.transaction:', res.body.transaction)
        return resolve(res.body.transaction[0])
      })
  })
}

module.exports = router
